var ldap = require('ldapjs');

module.exports = exports = {

	init: function(options, api, cb) {
		this.dn = options.dn;
		this.scope = options.scope;
		this.User = api.models.User;
		this.client = ldap.createClient({
			url: options.url
		});
		process.nextTick(cb);
	},

	authenticate: function(username, password, done) {

		var client = this.client;
		var dn = this.dn;
		var User = this.User;

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

	}

}