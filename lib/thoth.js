var util = require('util');
var App = require('armature').App;
var ArmatureError = require('armature').Error;
var mongoose = require('mongoose');
var _ = require('lodash');

function Thoth() {

  this._loadConfig();
  this._initLogger();
  this._initDefaultListeners();
  this._initApi();
  this._registerPlugins();

  this.name = 'thoth';

  // Définition des phases d'initialisation de l'application
  // Voir module armature
  this.addInitSteps(
    this._getPassphrase,
    this._checkPassphrase,
    this._initModels,
    this._initDatabaseConnection,
    this.loadPlugins,
    this._loadRBAC,
    this._registerDefaultTasks
  );

  // Définition des phases de fermeture de l'application
  this.addTermSteps(
    this.unloadPlugins,
    this._closeDatabaseConnection
  );

}

util.inherits(Thoth, App);

var p = Thoth.prototype;

// Démarre le serveur Web Thoth
p.startWebServer = function(cb) {
  var app = this;
  this.initialize(function(err) {
    if(err) {
      return cb(err);
    }
    app._initExpressApp(function(err) {
      if(err) {
        return cb(err);
      }
      app.logger.info('Listen', {
        host: app.config.get('server:host'),
        port: app.config.get('server:port')
      });
    });
  });
};

// Enregistre les plugins à démarrer à partir du fichier configuration
p._registerPlugins = function() {
  var app = this;
  var plugins = app.config.get('plugins') || {};
  Object.keys(plugins).forEach(function(pluginId) {
    var p = plugins[pluginId];
    app.registerPlugin(p.path, p.options);
  });
};

// Charge la configuration, voir util/config
p._loadConfig = function() {
  this.config = require('./util/config');
};

p._initDefaultListeners = function() {

  var app = this;

  app.on('load', function(pluginName) {
    app.logger.info('Load', {plugin: pluginName});
  });

  app.on('unload', function(pluginName) {
    app.logger.info('Unload', {plugin: pluginName});
  });

  // On coupe l'application proprement en cas de signal SIGINT
  process.on('SIGINT', function() {
    app.logger.info('SIGINT intercepted');
    app.terminate(function(err) {
      if(err) {
        app.logger.error(err.stack);
        return process.exit(1);
      }
      app.logger.info('Terminated successfully');
      return process.exit();
    })
  });

};

// Initialise l'API publique de l'application Thoth disponible pour les plugins
p._initApi = function() {
  var app = this;
  this.api = {
    // Authentification des utilisateurs
    auth: require('./auth'),
    // Gestion des "tasks" pour l'outil d'administration en ligne de commande
    tasks: require('./tasks'),
    // Accès à la configuration générale de l'application
    config: this.config,
    // Logger
    logger: this.logger,
    // Gestion des droits d'accès des utilisateurs
    acl: require('./util/acl')(app)
  };
};

// Chargement des Catégories/Roles/Droits d'accès depuis le fichier de configuration
p._loadRBAC = function(cb) {

  var rbac = require('mongoose-rbac');
  var async = require('async');
  var app = this;
  var rbacConfig = app.config.get('rbac') || {};

  var roles = Object.keys(rbacConfig);

  async.series([

    // On supprime les permissions existantes en base pour éviter
    // les permissions doublons ou orphelines (sans rôle associé)
    function flushPermissions(next) {
      app.logger.debug('Flush permissions');
      rbac.Permission.remove(next);
    },

    // On créé de nouveaux rôles ou on complète ceux existants
    function completeRoles(next) {

      // Pour chaque rôle défini dans la configuration
      async.forEach(roles, function(roleName, next) {

        async.waterfall([

          // Soit on trouve le rôle, soit on le créait
          function findOrCreateRole(next) {

            app.logger.debug('Search role', {role: roleName});

            rbac.Role.findOne({name: roleName}, function(err, role) {

              if(err) {
                return next(err);
              }

              if(!role) { // Aucun rôle existant !

                app.logger.debug('Create role', {role: roleName});

                // On créait un nouveau rôle
                role = new rbac.Role({name: roleName});
                return role.save(function(err, role) {
                  if(err) {
                    return next(err);
                  }
                  return next(null, role);
                });

              } else { // Rôle existant !

                app.logger.debug('Found role', {role: roleName});

                return next(null, role);
              }
            });
          },

          // On met à jour les permissions du rôle
          function updatePermissions(role, next) {

            var permissions = rbacConfig[roleName];

            rbac.Permission.findOrCreate(permissions, function(err) {
              if(err) {
                return next(err);
              }
              role.permissions = Array.prototype.slice.call(arguments, 1);
              app.logger.debug('Add permissions', {
                role: roleName, permission: permissions
              });
              return role.save(next);
            });
          }

        ], next);

      }, next);

    }

  ], cb);

};

// Initialisation du logger, accessible via this.logger ou this.api.logger
p._initLogger = function() {

  var winston = require('winston');
  var logConfig = this.config.get('log');

  var logger = new winston.Logger({
    transports: [
      new winston.transports.Console(logConfig)
    ]
  });

  this.logger = logger;

};

// Prompt pour la passphrase
p._getPassphrase = function(done) {
  var app = this;
  var passwd = require('./util/passwd');
  passwd.getPassphrase(function(err, passphrase) {
    if(err) {
      return done(err);
    }
    app._passphrase = passphrase;
    return done();
  });
};

// Vérification de la passphrase:
// Un fichier '.hmac' est créé à la racine de l'application
// (configuration par défaut) dans lequel est stocké un HMAC
// d'une phrase statique, signé avec la passphrase.
// A chaque lancement de l'application, le HMAC du fichier et
// celui généré avec la nouvelle passphrase entrée sont comparés.
// Si les résultats diffèrent, alors la passphrase a changée et
// une alerte est affichée.
p._checkPassphrase = function(cb) {

  var fs = require('fs');
  var crypto = require('crypto');
  var passphrase = this._passphrase;

  // Récupère le HMAC signé avec la passphrase
  function getHmac(secret) {
    var hmac = crypto.createHmac('sha256', secret);
    hmac.write("These aren't the droids you're looking for");
    hmac.end();
    return hmac.read().toString('base64');
  }

  // Récupération du chemin du fichier .hmac
  var hmacPath = this.config.get('encryption:hmacPath');
  var oldHmac;

  // Lecture du fichier HMAC
  try {
    oldHmac = fs.readFileSync(hmacPath, {encoding: 'utf8'});
  } catch(err) {
    this.logger.warn("Couldn't read previous HMAC !");
  }

  
  if(oldHmac) { // Si on a un ancien HMAC, on compare l'ancien à l'actuel

    var newHmac = getHmac(passphrase);

    if(newHmac !== oldHmac) { // Les HMAC sont différents !

      this.logger.warn("It seems that your passphrase has changed.");
      this.logger.warn("Erase " + hmacPath + " if you are sure what you're doing !");

      return process.nextTick(
        cb.bind(null, new Error('Passphrase changed !'))
      );

    } else { // Les HMAC sont les mêmes, les passphrases sont identiques
      return process.nextTick(cb);
    }

  } else { // Sinon, pas de HMAC -> première utilisation

    // On écrit le HMAC actuel dans le fichier
    try {
      fs.writeFileSync(hmacPath, getHmac(passphrase), {encoding: 'utf8'});
    } catch(err) {
      return process.nextTick(cb.bind(null, err));
    }

    return process.nextTick(cb);

  }

};

// Initialise la connexion à la base de données
p._initDatabaseConnection = function(cb) {

  this.logger.info('Connecting to database');

  var dbUri = this.config.get('database:uri');
  var dbOpts = this.config.get('database:options');

  if(!dbUri) {
    return cb(new Error('"database:uri" is not defined in configuration !'));
  }
  
  var con = mongoose.connection;

  function connectionHandler(err) {
    con.removeListener('error', connectionHandler);
    if(err) {
      return cb(err);
    } else {
      return cb();
    }
  }

  con.on('error', connectionHandler);
  con.once('open', connectionHandler);
  con.on('error', this._handleDatabaseError.bind(this));

  mongoose.connect(dbUri, dbOpts);

};

// Gestion des erreurs de la base de données
p._handleDatabaseError = function(err) {
  this.logger.error(err.stack);
};

// Clos la connexion à la base de données
p._closeDatabaseConnection = function(next) {
  this.logger.info('Closing database connection');
  return mongoose.connection.close(next);
};

// Initialise les modèles MongooseJS
p._initModels = function(cb) {

  this.logger.info('Initializing models');

  var encryptPlugin = require('./models/plugins/encrypt');

  encryptPlugin.defaults.algorithm = this.config.get('encryption:algorithm') || 'aes256';
  encryptPlugin.defaults.secret = this._passphrase;

  var models = this.api.models = {};
  models.User = require('./models/user');

  models.Record = require('./models/record');

  process.nextTick(cb);

};

// Initialise l'application Express (serveur web)
p._initExpressApp = function(cb) {

    require('express-namespace');

    var app = this;
    var server;
    var mongoose = require('mongoose');
    var express = require('express');
    var auth = require('./auth');
    var basicAuth = require('./util/middlewares/basic-auth');
    var apiErrorMdw = require('./util/middlewares/api-error');
    var dbCheck = require('./util/middlewares/db-check');
    var logger = require('./util/middlewares/logger');
    var expressApp = express();


    // Middlewares généraux
    expressApp.use(logger({logger: app.logger}));
    expressApp.use(express.compress());
    expressApp.use(express.bodyParser());
    expressApp.use(express.query());
    expressApp.use(express.cookieParser());


    //Middleware spécifiques à l'API REST

    // Définitition du middleware d'authentification HTTP Basic Auth
    var basicAuthMdw = basicAuth(
      auth.authenticate,
      this.config.get('server:realm')
    );

    // Middleware de vérification de la connexion à la BDD
    var dbCheckMdw = dbCheck(mongoose.connection);

    // Définition des routes HTTP REST, toutes avec le prefixe /api
    expressApp.namespace('/api', dbCheckMdw, basicAuthMdw, 
      function() {
        // Base Api
        require('./routes/users')(expressApp, app.api);
        require('./routes/auth')(expressApp, app.api);
        require('./routes/records')(expressApp, app.api);
        require('./routes/export')(expressApp, app.api);
      }
    );

    var serverConfig = this.config.get('server');

    // L'application doit elle servir le client Web ?
    if(serverConfig.serveClient) {
      this.logger.info('Serving web client');
      expressApp.use(express.static(__dirname + '/../client'));
    }

    // Gestion certificats SSL si définis
    var ssl = serverConfig.ssl;
    if(ssl && ssl.key && ssl.cert) {
      this.logger.log('Using SSL mode');
      var fs = require('fs');
      var https = require('https');
      'key cert pfx ca crl'.split(' ').forEach(function(k) {
        if(k in ssl && ssl[k]) {
          ssl[k] = fs.readFileSync(ssl[k]);
        }
      });
      server = https.createServer(ssl, expressApp);
    } else {
      var http = require('http');
      server = http.createServer(expressApp);
    }
    
    expressApp.use(apiErrorMdw.bind(this));

    server.listen(serverConfig.port, serverConfig.host, cb);

};

// Démarrage du client d'administration en ligne de commande
p.cli = function() {

  var program = require('commander');
  var app = this;
  var tasks = app.api.tasks;
  var pkg = require('../package.json');

  program
    .version(pkg.version)
    .usage('[options] <namespace> <command>');

  program.parse(process.argv);

  // Initialisation de Thoth
  app.initialize(function(err) {

    if(err) {
      app.logger.error(err.stack);
      return process.exit(1);
    }

    program.on('--help', tasks.showHelp);

    app.logger.info('Starting CLI')

    //Récupération du namespace et du nom de la tâche
    var namespace = program.args[0];
    var taskName = program.args[1];

    // Si pas d'espace de nom ou pas de tâche, on affiche l'aide
    if(!namespace || !taskName) {
      return program.help();
    }

    // On récupère la tâche
    var task = tasks.getTask(namespace, taskName);
    
    if(!task) { // Pas de tâche, affichage d'un message d'erreur et exit
      app.logger.error('Couldn\'t found task: ' + taskName);
      return process.exit(1);
    }

    app.logger.info('Task', {name: taskName});

    // Lancement de la tâche
    task.fn.call(null, app, program);

  });

};

// Définition des tâches par défaut dans le client d'administration
p._registerDefaultTasks = function(cb) {

  var addRole = require('./tasks/defaults/add-role');
  var removeRole = require('./tasks/defaults/remove-role');
  var viewRoles = require('./tasks/defaults/view-roles');

  this.api.tasks.registerTask(
    'default',
    'add-role',
    addRole,
    'Add a selected role to a registered user'
  );

  this.api.tasks.registerTask(
    'default',
    'remove-role',
    removeRole,
    'Remove a selected role from a registered user'
  );

  this.api.tasks.registerTask(
    'default',
    'view-roles',
    viewRoles,
    'View roles for a registered user'
  );

  process.nextTick(cb);

};

module.exports = exports = Thoth;
