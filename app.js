var express = require('express');
var config = require('config');
var http = require('http');
var Sequelize = require('sequelize');
var pass = require('./lib/passphrase');
var auth = require('./lib/auth');
var models = require('./lib/models')
var app = express();

// Assign HTTP middlewares
app.use(express.logger());
app.use(express.basicAuth(auth.checkUserAuth));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.query());
app.use(express.cookieParser());

// Define HTTP routes
var routes = require('./lib/routes');
routes.bindTo(app);

app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler());

pass.askPassphrase(function(answer) {

	if(answer.trim()) {

		// Define Lynx server encryption passphrase
		app.set('passphrase', answer);

		// Initialize Sequelize ORM
		var sequelize = new Sequelize(
			config.database.name, 
			config.database.user, 
			config.database.password, 
			config.database.options
		);

		// Initialize models
		models.initialize(sequelize);

		// Create HTTP Server & start listening requests
		var address = config.address === '*' ? '' : config.address;
		var port = config.port || 80;

		var server = http.createServer(app);
		server.listen(port, address, function() {
			console.log('Server listening on http://'+config.address+':'+port);
		});

	} else console.error("Passphrase shouldn't be empty. Aborting.");

});



