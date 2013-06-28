exports.initApi = function(config, api, cb) {
	var authHelpers = require('./util/auth/helpers');
	api.auth = authHelpers;
	process.nextTick(cb);
}

exports.initModels = function(config, api, cb) {

	var encryptPlugin = require('./models/plugins/encrypt');

	encryptPlugin.defaults.algorithm = config.encryption.algorithm || 'aes256';
	encryptPlugin.defaults.secret = api.passphrase;

	var models = api.models = {};
	api.applyHooks('app:beforeModels', [config, api]);
	models.User = require('./models/user');
	models.Record = require('./models/record');
	api.applyHooks('app:afterModels', [config, api]);
	process.nextTick(cb);

};

exports.initPlugins = function(config, api, cb) {
	var async = require('async');
	var path = require('path');
	var plugins = config.plugins;
	async.forEach(plugins, function(p, cb) {
		var pPath = p.path
		var re = /^\./
		if(re.test(pPath)) pPath = path.resolve(pPath);
		var plugin = require(pPath);
		plugin.init(p.options, api, cb);
	}, cb);
};

exports.initDatabaseConnection = function(config, api, cb){
	var mongoose = require('mongoose');
	mongoose.connect(config.database);
	var db = mongoose.connection;
	db.on('error', cb);
	db.once('open', cb);
}

exports.initLocalAuthStrategy = function(config, api, cb) {
	var localAuth = require('./util/auth/local');
	localAuth.init(config, api, cb)
};

exports.initAuthStrategy = function(config, api, cb) {

	api.applyHooks('app:beforeAuth', [config, api]);

	var basicAuth = require('./util/auth/middlewares/basic-auth');
	var strategyName = config.auth;
	var strategy = api.auth.getAuthStrategy(strategyName);

	if(!strategy) 
		return process.nextTick(cb.bind(null, new Error('Invalid auth strategy ' + strategyName + ' !')));

	api.auth.authenticate = basicAuth(strategy.authenticate.bind(strategy), 'Thoth');

	api.applyHooks('app:afterAuth', [config, api]);

	process.nextTick(cb);
};

exports.initExpressApp = function(config, api, cb) {

	require('express-namespace');
	var express = require('express');
	var app = express();

	//app.use(express.logger());
	app.use(express.compress());
	app.use(express.bodyParser());
	app.use(express.query());
	app.use(express.cookieParser());

	api.applyHooks('app:beforeRoutes', [config, api, app]);

	// Define HTTP routes
	app.namespace('/api', api.auth.authenticate, function() {

		api.applyHooks('app:beforeApiRoutes', [config, api, app]);

		// Base Api
		require('./routes/users')(app, api);
		require('./routes/auth')(app, api);
		require('./routes/records')(app, api);

		api.applyHooks('app:afterApiRoutes', [config, api, app]);

	});

	api.applyHooks('app:afterRoutes', [config, api, app]);

	app.use(express.static(__dirname + '/../public'));
	app.use(express.errorHandler());

	api.app = app;

	process.nextTick(cb);

};

exports.askPassphrase = function(config, api, cb) {
	var program = require('commander');
	program.password("Please enter encryption passphrase: ", '*', function(answer) {
		process.stdin.destroy();
		if(!answer.trim()) return cb(new Error("Passphrase should'nt be empty !"));
		api.passphrase = answer;
		cb();
	});
};