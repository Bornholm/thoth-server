var ldap = require('ldapjs');

module.exports = exports = {

	load: function(pluginOpts, next) {

		var client = ldap.createClient({
			url: pluginOpts.url,
			port: pluginOpts.port
		});		

		require('./lib/auth-handling')(pluginOpts, this.api, client);
    require('./lib/tasks/create-ldap-user')(pluginOpts, this.api, client);
    require('./lib/tasks/search-ldap')(pluginOpts, this.api, client);
		
		process.nextTick(next);

	}

}