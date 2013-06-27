var bcrypt = require('ldapjs');

module.exports = exports = {

	init: function(config, api, pluginOpts) {

		var User = api.models.User;
		var dn = pluginOpts.dn;
		var scope = pluginOpts.scope;

		var client = ldap.createClient({
			url: pluginOpts.url
		});

		api.auth.registerAuthStrategy('ldap', {

			authenticate: function(username, password, cb) {

				var opts = {
					filter: 'uid=' + username,
					scope: this.scope
				};

				client.search(dn, opts, function(err, res) {

					if(err) return done(err);

					// We have a match in LDAP
					res.once('searchEntry', function(entry) {
						res.removeAllListeners();

						var userDn = entry.object.dn;

						// Try to bind with user password & dn
						client.bind(userDn, password, function(err) {
							if(err) return done(err);

							// If bind successful, search matching user in local db
							User.findOne({'auth.ldap.uid': username}, function(err, user) {
								if(err) return done(err);
								if(user) return done(null, user);
								//TEMP If user doesn't exists, create one ?
								user = new User();
								user.auth = user.auth || {};
								user.auth.ldap = {
									uid: username
								};
								user.markModified('auth');
								user.save(function(err) {
									if(err) return done(err);
									done(null, user);
								});
							});
							
						});

					});

					// Error occured
					res.once('error', function(err) {
						res.removeAllListeners();
				    done(err);
				  });

					// User doesn't exist in LDAP
				  res.once('end', function(err) {
						res.removeAllListeners();
				    done(null, false);
				  });

				});

			},

			register: function(username, password, cb) {
				cb();
			}
			
		});

	}

}