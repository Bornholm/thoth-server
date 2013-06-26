var config = require('config');
var async = require('async');
var mongoose = require('mongoose');
var bootstrap = require('./lib/bootstrap');

var api = {};

async.applyEachSeries([
		bootstrap.askPassphrase,
		bootstrap.initModels,
		bootstrap.initAuthStrategy,
		bootstrap.initExpressApp
	],
	config, api,
	function(err) {

		if(err) throw err;

		mongoose.connect(config.database);
		var db = mongoose.connection;
		db.on('error', console.error.bind(console));
		db.once('open', function callback () {
		  	var http = require('http');
				var server = http.createServer(api.app);
				server.listen(config.web.port, config.web.address, function() {
					console.log('Server listening on http://'+config.web.address+':'+config.web.port);
				});
		});

	}

);



