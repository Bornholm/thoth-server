var util = require('util');
var App = require('armature').App;
var ArmatureError = require('armature').Error;
var mongoose = require('mongoose');
var config = require('config');

function Thoth() {

  this.name = 'thoth';

  this.plugins = this._getPluginsPaths();

  this.init = [
    this._askPassphrase,
    this._checkPassphrase,
    this._initModels,
    this._initDatabaseConnection,
    this.loadPlugins,
    this._initAuthBackend
  ];

  this.exit = [
    this.unloadPlugins
  ];

  this._initLogger();
  this._initApi();

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

p.getPluginOpts = function(pluginId, cb) {
  var pluginsConf = config.plugins || {};
  var conf;
  if(pluginsConf[pluginId]) {
    conf = pluginsConf[pluginId].options;
  }
  process.nextTick(cb.bind(null, null, conf));
};

p._getPluginsPaths = function() {
  var pluginsConf = config.plugins || {};
  return Object.keys(pluginsConf)
    .map(function(pluginId) {
      return pluginsConf[pluginId].path;
    });
};

p._initApi = function() {
  this.api = {
    auth: require('./util/auth/helpers')
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

  var program = require('commander');
  var crypto = require('crypto');
  var passphrase = this._passphrase;

  function getHmac(secret) {
    var hmac = crypto.createHmac('sha256', secret);
    hmac.write("These aren't the droids you're looking for");
    hmac.end();
    return hmac.read().toString('base64');
  }

  var oldHmac = config.encryption.oldHmac;
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
    config.encryption.oldHmac = getHmac(passphrase);
    return process.nextTick(cb);
  }

};

p._initDatabaseConnection = function(cb) {

  this.logger.info('Connecting to database');
  
  var con = mongoose.connection;

  con.on('error', cb);
  con.once('open', cb);

  mongoose.connect(config.database);

};

p._initModels = function(cb) {

  this.logger.info('Initializing models');

  var encryptPlugin = require('./models/plugins/encrypt');

  encryptPlugin.defaults.algorithm = config.encryption.algorithm || 'aes256';
  encryptPlugin.defaults.secret = this._passphrase;

  var models = this.api.models = {};
  models.User = require('./models/user');
  models.Record = require('./models/record');

  process.nextTick(cb);

};

p._initAuthBackend = function(cb) {

  var basicAuth = require('./util/middlewares/basic-auth');
  var authType = config.auth;
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

    var http = require('http');
    var express = require('express');
    var basicAuth = require('./util/middlewares/basic-auth');
    var apiErrorHandler = require('./util/middlewares/api-error-handler');
    var exp = express();
    var server = http.createServer(exp);

    //app.use(express.logger());
    exp.use(express.compress());
    exp.use(express.bodyParser());
    exp.use(express.query());
    exp.use(express.cookieParser());

    var authBackend = this.api.auth.getAuthBackend(config.auth);
    var basicAuthHandler = basicAuth(
      authBackend.authenticate,
      'Thoth'
    );

    // Define HTTP routes
    exp.namespace('/api', apiErrorHandler, basicAuthHandler, 
      function() {
        // Base Api
        require('./routes/users')(exp, this.api);
        require('./routes/auth')(exp, this.api);
        require('./routes/records')(exp, this.api);
      }
    );

    exp.use(express.static(__dirname + '/../public'));
    exp.use(express.errorHandler());

    server.listen(config.web.port, config.web.address, cb);

};

module.exports = exports = Thoth;