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

  this.addInitSteps(
    this._askPassphrase,
    this._checkPassphrase,
    this._initModels,
    this._initDatabaseConnection,
    this.loadPlugins,
    this._loadRBAC,
    this._registerDefaultTasks
  );

  this.addTermSteps(
    this.unloadPlugins,
    this._closeDatabaseConnection
  );

}

util.inherits(Thoth, App);

var p = Thoth.prototype;

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

p._registerPlugins = function() {
  var app = this;
  var plugins = app.config.get('plugins') || {};
  Object.keys(plugins).forEach(function(pluginId) {
    var p = plugins[pluginId];
    app.registerPlugin(p.path, p.options);
  });
};

p._loadConfig = function() {

  var path = require('path');
  var nconf = require('nconf');
  var os = require('os');
  var yamlFormat = require('./util/yaml-format');

  nconf
    .env()
    .argv();

  // Load configuration files defaults.json -> $ENV.json -> $HOSTNAME.json
  var configDir = nconf.get('configDir') || 'config';

  nconf.file('environment', {
    file: path.join(configDir, process.env.NODE_ENV + '.yaml'),
    format: yamlFormat
  });
  
  nconf.file('host', {
    file: path.join(configDir, os.hostname() + '.yaml'),
    format: yamlFormat
  });
  
  nconf.file('defaults', {
    file: path.join(configDir, 'defaults.yaml'),
    format: yamlFormat
  });

  this.config = nconf;

};

p._initDefaultListeners = function() {

  var app = this;

  app.on('load', function(pluginName) {
    app.logger.info('Load', {plugin: pluginName});
  });

  app.on('unload', function(pluginName) {
    app.logger.info('Unload', {plugin: pluginName});
  });

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

p._initApi = function() {
  var app = this;
  this.api = {
    auth: require('./auth'),
    tasks: require('./tasks'),
    config: this.config,
    logger: this.logger,
    acl: require('./util/acl')(app)
  };
};

p._loadRBAC = function(cb) {

  var rbac = require('mongoose-rbac');
  var async = require('async');
  var app = this;
  var rbacConfig = app.config.get('rbac') || {};

  var roles = Object.keys(rbacConfig);

  async.series([
    function flushPermissions(next) {
      app.logger.debug('Flush permissions');
      rbac.Permission.remove(next);
    },
    function completeRoles(next) {
      async.forEach(roles, function(roleName, next) {
        async.waterfall([
          function findOrCreateRole(next) {
            app.logger.debug('Search role', {role: roleName});
            rbac.Role.findOne({name: roleName}, function(err, role) {
              if(err) {
                return next(err);
              }
              if(!role) {
                app.logger.debug('Create role', {role: roleName});
                role = new rbac.Role({name: roleName});
                return role.save(function(err, role) {
                  if(err) {
                    return next(err);
                  }
                  return next(null, role);
                });
              } else {
                app.logger.debug('Found role', {role: roleName});
                return next(null, role);
              }
            });
          },
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

p._askPassphrase = function(cb) {
  var program = require('commander');
  var app = this;

  program
    .option('-p, --passphrase <passphrase>', 'specify the passphrase to use', String);

  program.parse(process.argv);

  var passphrase = program.passphrase || app.config.get('encryption:passphrase');

  if(passphrase) {
    app._passphrase = passphrase;
    return process.nextTick(cb);
  } else {
    return program.password(
      'Please enter passphrase: ', 
      '*', 
      function(answer) {
        if(!answer.trim()) {
          return cb(new ArmatureError({
              message: 'Passphrase shouldn\'t be empty !'
            })
          );
        }
        app._passphrase = answer;
        cb();
      }
    );
  }
};

p._checkPassphrase = function(cb) {

  var fs = require('fs');
  var program = require('commander');
  var crypto = require('crypto');
  var passphrase = this._passphrase;

  function getHmac(secret) {
    var hmac = crypto.createHmac('sha256', secret);
    hmac.write("These aren't the droids you're looking for");
    hmac.end();
    return hmac.read().toString('base64');
  }

  var hmacPath = this.config.get('encryption:hmacPath');
  var oldHmac;
  try {
    oldHmac = fs.readFileSync(hmacPath, {encoding: 'utf8'});
  } catch(err) {
    this.logger.warn("Couldn't read previous HMAC !");
  }
  if(oldHmac) {
    var newHmac = getHmac(passphrase);
    if(newHmac !== oldHmac) {
      this.logger.warn("It seems that your passphrase has changed !");
      program.confirm('Continue (y/n) ? ', function(ok) {
        if(ok) {
          return cb();
        }
        process.exit(1);
      });
    } else {
      return process.nextTick(cb);
    }
  } else {
    try {
      fs.writeFileSync(hmacPath, getHmac(passphrase), {encoding: 'utf8'});
    } catch(err) {
      return process.nextTick(cb.bind(null, err));
    }
    return process.nextTick(cb);
  }

};

p._initDatabaseConnection = function(cb) {

  this.logger.info('Connecting to database');
  
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

  mongoose.connect(this.config.get('database'));

};


p._closeDatabaseConnection = function(next) {
  this.logger.info('Closing database connection');
  return mongoose.connection.close(next);
};

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

p._initExpressApp = function(cb) {

    require('express-namespace');

    var app = this;
    var server;
    var express = require('express');
    var auth = require('./auth');
    var basicAuth = require('./util/middlewares/basic-auth');
    var apiErrorHandler = require('./util/middlewares/api-error-handler');
    var logger = require('./util/middlewares/logger');
    var expressApp = express();

    expressApp.use(logger({logger: app.logger}));
    expressApp.use(express.compress());
    expressApp.use(express.bodyParser());
    expressApp.use(express.query());
    expressApp.use(express.cookieParser());

    var basicAuthHandler = basicAuth(
      auth.authenticate,
      this.config.get('server:realm')
    );

    // Define HTTP routes
    expressApp.namespace('/api', apiErrorHandler, basicAuthHandler, 
      function() {
        // Base Api
        require('./routes/users')(expressApp, app.api);
        require('./routes/auth')(expressApp, app.api);
        require('./routes/records')(expressApp, app.api);
        require('./routes/export')(expressApp, app.api);
      }
    );

    var serverConfig = this.config.get('server');

    if(serverConfig.serveClient) {
      this.logger.info('Serving web client');
      expressApp.use(express.static(__dirname + '/../client'));
    }

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
    
    expressApp.use(apiErrorHandler.bind(this));

    server.listen(serverConfig.port, serverConfig.host, cb);

};

/*
 * CLI
 */

// Thanks commander :)
function getLargestCommandLength(tasks) {
  return tasks.reduce(function(max, task) {
    return Math.max(max, task.name.length);
  }, 0);
};

function pad(str, width) {
  var len = Math.max(0, width - str.length);
  return str + Array(len + 1).join(' ');
}

p.cli = function() {

  var program = require('commander');
  var app = this;
  var tasks = app.api.tasks;
  var pkg = require('../package.json');

  program
    .version(pkg.version)
    .usage('[options] <command>');

  program.parse(process.argv);

  app.initialize(function(err) {

    if(err) {
      app.logger.error(err.stack);
      return process.exit(1);
    }

    var width = getLargestCommandLength(tasks.getAllTasks());
    program.on('--help', function() {
      console.log('   Commands:');
      console.log('');
      tasks.getAllTasks()
        .reverse()
        .forEach(function(task) {
          console.log('    ' + pad(task.name, width) + '\t' + task.description);
        });
      console.log('');
    });

    app.logger.info('Starting CLI')

    var taskName = program.args[0];

    if(!taskName) {
      return program.help();
    }

    var task = tasks.getTask(taskName);
    
    if(!task) {
      app.logger.error('Couldn\'t found task: ' + taskName);
      return process.exit(1);
    }

    app.logger.info('Task', {name: taskName});
    task.fn.call(null, app, program);

  });

};

p._registerDefaultTasks = function(cb) {

  var addRole = require('./tasks/defaults/add-role');
  var removeRole = require('./tasks/defaults/remove-role');

  this.api.tasks.registerTask(
    'add-role',
    addRole,
    'Add a selected role to a registered user'
  );

  this.api.tasks.registerTask(
    'remove-role',
    removeRole,
    'Remove a selected role from a registered user'
  );

  process.nextTick(cb);

};

module.exports = exports = Thoth;