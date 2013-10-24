var ldap = require('ldapjs');

module.exports = exports = {

	load: function(pluginOpts, next) {

		var client = ldap.createClient({
			url: pluginOpts.url,
			port: pluginOpts.port
		});		

		require('./auth-handling')(pluginOpts, this.api, client);
		

		process.nextTick(next);

	}

}