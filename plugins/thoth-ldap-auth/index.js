var ldap = require('ldapjs');

module.exports = exports = {

	load: function(pluginOpts, next) {

		var User = this.api.models.User;
		var dn = pluginOpts.dn;
		var scope = pluginOpts.scope;
		var api = this.api;

		var client = ldap.createClient({
			url: pluginOpts.url,
			port: pluginOpts.port
		});

		var validator = new RegExp(pluginOpts.validator || '');

		api.auth.registerAuthBackend('ldap', {

			authenticate: function(username, password, cb) {

				var isUsernameValid = validator.test(username);
				if(!isUsernameValid) {
					return cb(new Error('Invalid username format !'));
				}

				var filter = pluginOpts.filter.replace('${username}', username);

				var opts = {
					filter: filter,
					scope: scope
				};

				client.search(dn, opts, function(err, res) {

					if(err) {
						return cb(err);
					}

					// We have a match in LDAP
					res.once('searchEntry', function(entry) {
						res.removeAllListeners();

						var userDn = entry.object.dn;

						// Try to bind with user password & dn
						client.bind(userDn, password, function(err) {
							if(err) {
								return cb(err);
							}

							// If bind successful, search matching user in local db
							User.findOne({'auth.ldap.uid': username}, function(err, user) {
								if(err) {
									return cb(err);
								}
								if(user) {
									return cb(null, user);
								}
								//TEMP If user doesn't exists, create one ?
								user = new User();
								user.name = entry.object.cn;
								user.email = entry.object.mail;
								user.auth = user.auth || {};
								user.auth.ldap = {
									uid: username
								};
								user.markModified('auth');
								user.save(function(err) {
									if(err) {
										return cb(err);
									}
									cb(null, user);
								});
							});
							
						});

					});

					// Error occured
					res.once('error', function(err) {
						res.removeAllListeners();
				    cb(err);
				  });

					// User doesn't exist in LDAP
				  res.once('end', function(err) {
						res.removeAllListeners();
				    cb(null, false);
				  });

				});

			},

			register: function(username, password, cb) {
				cb();
			}
			
		});

		process.nextTick(next);

	}

}