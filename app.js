var config = require('config');
var async = require('async');
var bootstrap = require('./lib/bootstrap');
var Hookable = require('./lib/util/hookable');

var api = new Hookable();

async.applyEachSeries([
		bootstrap.askPassphrase,
		bootstrap.initApi,
		bootstrap.initPlugins,
		bootstrap.initDatabaseConnection,
		bootstrap.initModels,
		bootstrap.initAuthStrategy,
		bootstrap.createDefaultAdmin,
		bootstrap.initExpressApp
	],
	config, api,
	function(err) {
		if(err) throw err;
  	var http = require('http');
		var server = http.createServer(api.app);
		server.listen(config.web.port, config.web.address, function() {
			console.log('Server listening on http://'+config.web.address+':'+config.web.port);
		});
	}

);



