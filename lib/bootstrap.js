exports.initModels = function(config, api, cb) {

	var encryptPlugin = require('./models/plugins/encrypt');

	encryptPlugin.defaults.algorithm = config.encryption.algorithm || 'aes256';
	encryptPlugin.defaults.secret = api.passphrase;

	var models = api.models = {};

	models.User = require('./models/user');
	models.Record = require('./models/record');

	process.nextTick(cb);

};

exports.initAuthStrategy = function(config, api, cb) {

	var basicAuth = require('./util/auth/middlewares/basic-auth');
	var path = require('path');

	var sPath = config.auth.strategy;
	var re = /^\./
	if(re.test(sPath)) sPath = path.resolve(sPath);

	var strategy = require(sPath);
	api.auth = {};
	api.auth.strategy = strategy;
	//TODO avoid popup with ajax http://loudvchar.blogspot.ca/2010/11/avoiding-browser-popup-for-401.html
	api.auth.authenticate = basicAuth(strategy.authenticate.bind(strategy), 'Thoth');
	strategy.init(config.auth.options, api, cb);

};

exports.initExpressApp = function(config, api, cb) {

	require('express-namespace');
	var express = require('express');
	var app = express();

	app.use(express.logger());
	app.use(express.compress());
	app.use(express.bodyParser());
	app.use(express.query());
	app.use(express.cookieParser());

	// Define HTTP routes
	app.namespace('/api', api.auth.authenticate, function() {
		require('./routes/users')(app, api);
		require('./routes/auth')(app, api);
	});

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