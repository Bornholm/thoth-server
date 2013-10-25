var util = require('util');
var App = require('armature').App;
var ArmatureError = require('armature').Error;
var mongoose = require('mongoose');
var _ = require('lodash');

function Thoth() {

  this._loadConfig();
  this._initLogger();
  this._initApi();
  this._registerPlugins();

  this.name = 'thoth';

  this.addInitSteps(
    this._askPassphrase,
    this._checkPassphrase,
    this._initModels,
    this._initDatabaseConnection,
    this._createAdminRole,
    this.loadPlugins,
    this._initAuthBackend,
    this._registerDefaultTasks
  );

  this.addTermSteps(
    this.unloadPlugins
  );

}

util.inherits(Thoth, App);

var p = Thoth.prototype;

p.startWebServer = function(cb) {
  var app = this;
  app.logger.info('Initializing');
  this.initialize(function(err) {
    if(err) {
      return cb(err);
    }
    app.logger.info('Initialized');
    app._initExpressApp(function(err) {
      if(err) {
        return cb(err);
      }
      app.logger.info('Listen');
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

  nconf
    .env()
    .argv();

  // Load configuration files defaults.json -> $ENV.json -> $HOSTNAME.json
  var configDir = nconf.get('configDir') || 'config';

  nconf.file('host', path.join(configDir, os.hostname() + '.json'));
  nconf.file('environment', path.join(configDir, process.env + '.json'));
  nconf.file('defaults', path.join(configDir, 'defaults.json'));

  this.config = nconf;

};

p._initApi = function() {
  this.api = {
    auth: require('./auth'),
    tasks: require('./tasks'),
    config: this.config
  };
};

p._initLogger = function() {
  this.logger = console;
};

p._askPassphrase = function(cb) {
  var program = require('commander');
  var app = this;
  program.password(
    'Please enter encryption passphrase: ', 
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
    this.logger.warn("Could'nt read old HMAC !");
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

  con.on('error', cb);
  con.once('open', cb);

  mongoose.connect(this.config.get('database'));

};

p._initModels = function(cb) {

  this.logger.info('Initializing models');

  var encryptPlugin = require('./models/plugins/encrypt');

  encryptPlugin.defaults.algorithm = this.config.get('encryption:algorithm') || 'aes256';
  encryptPlugin.defaults.secret = this._passphrase;

  var models = this.api.models = {};
  models.User = require('./models/user');
  models.Record = require('./models/record');
  models.Role = require('./models/plugins/resources-access').Role;

  process.nextTick(cb);

};

p._createAdminRole = function(cb) {

  this.logger.info('Creating admin role');

  var Role = this.api.models.Role;

  Role.findOne({name: 'admin'}, function(err, role) {
    if(err) {
      return cb(err);
    }
    if(!role) {
      var role = new Role();
      role.name = 'admin';
      role.permissions.push({op: '*', q: '*'});
      role.markModified('permissions');
      role.save(function(err) {
        if(err) {
          return cb(err);
        }
        return cb(null);
      });
    } else {
      return cb(null);
    }
  });

};

p._initAuthBackend = function(cb) {

  var basicAuth = require('./routes/middlewares/basic-auth');
  var authType = this.config.get('auth');
  this.logger.info('Use auth backend:', authType);
  var authBackend = this.api.auth.getAuthBackend(authType);

  if(!authBackend) {
    return process.nextTick(
      cb.bind(
        null,
        new ArmatureError({
          message: 'Invalid auth backend ' + authType + ' !'
        })
      )
    );
  };

  this.api.auth.authenticate = basicAuth(
    authBackend.authenticate.bind(authBackend), 
    'Thoth'
  );

  process.nextTick(cb);

};

p._initExpressApp = function(cb) {

    require('express-namespace');

    var app = this;
    var server;
    var express = require('express');
    var basicAuth = require('./routes/middlewares/basic-auth');
    var apiErrorHandler = require('./routes/middlewares/api-error-handler');
    var expressApp = express();

    //app.use(express.logger());
    expressApp.use(express.compress());
    expressApp.use(express.bodyParser());
    expressApp.use(express.query());
    expressApp.use(express.cookieParser());

    var authBackend = this.api.auth.getAuthBackend(this.config.get('auth'));
    var basicAuthHandler = basicAuth(
      authBackend.authenticate,
      'Thoth'
    );

    // Define HTTP routes
    expressApp.namespace('/api', apiErrorHandler, basicAuthHandler, 
      function() {
        // Base Api
        require('./routes/users')(expressApp, app.api);
        require('./routes/auth')(expressApp, app.api);
        require('./routes/records')(expressApp, app.api);
        require('./routes/roles')(expressApp, app.api);
        require('./routes/tags')(expressApp, app.api);
        require('./routes/export')(expressApp, app.api);
      }
    );

    var serverConfig = this.config.get('server');

    if(serverConfig.serveClient) {
      this.logger.info('Serving web client...');
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

    server.listen(serverConfig.port, serverConfig.address, cb);

};

/*
 * CLI
 */

p.cli = function() {

  var program = require('commander');
  var app = this;
  var tasks = app.api.tasks;

   program
      .version('0.0.0')
      .usage('[options] <command>')
      .parse(process.argv)

  app.initialize(function(err) {

    if(err) {
      console.error(err.stack);
      return process.exit(1);
    }

    app.logger.info('Initialized');

    program.on('--help', function() {
        console.log('   Commands:');
        console.log('');
        tasks.getAllTasks()
          .forEach(function(task) {
            console.log('    ' + task.name + '\t' + task.description);
          });
        console.log('');
    });

    var taskName = program.args[0];

    if(!taskName) {
      return program.help();
    }

    var task = tasks.getTask(taskName);
    
    if(!task) {
      console.error(new Error('Couldn\'t load task: ' + taskName));
      return process.exit(1);
    }

    task.fn.call(null, app, program);

  });

};

p._registerDefaultTasks = function(cb) {

  var setAdmin = require('./tasks/defaults/set-admin');

  this.api.tasks.registerTask(
    'set-admin',
    setAdmin,
    'give admin access to an existing account'
  );

  process.nextTick(cb);

};

module.exports = exports = Thoth;