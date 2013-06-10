var express = require('express');
var config = require('config');
var http = require('http');
var mongoose = require('mongoose');
var pass = require('./lib/util/passphrase');
var app = express();

// Assign HTTP middlewares
app.use(express.logger());
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.query());
app.use(express.cookieParser());

// Define HTTP routes
require('./lib/routes')(app);

app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler());

pass.askPassphrase(function(answer) {

	if(answer.trim()) {

		// Define Toth server encryption passphrase
		app.set('passphrase', answer);

		var server = http.createServer(app);
		server.listen(config.web.port, config.web.address, function() {
			console.log('Server listening on http://'+config.web.address+':'+config.web.port);
		});

	} else console.error("Passphrase shouldn't be empty. Aborting.");

});



