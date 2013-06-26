var bcrypt = require('bcrypt');

module.exports = exports = {

	init: function(options, api, cb) {
		this.User = api.models.User;
		process.nextTick(cb);
	},

	authenticate: function(username, password, done) {
		var User = this.User;
		User.findOne({'auth.local.username': username}, function(err, user) {
			if(err) return done(err);
			if(user) {
				try {
					bcrypt.compare(password, user.auth.local.hash, function(err, res) {
						if(err) return done(err);
						done(null, res);
					});
				} catch(err) {
					return done(err);
				}
			} else return done(null, false);
		});
	}

}