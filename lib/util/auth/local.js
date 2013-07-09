var bcrypt = require('bcrypt');

function initAuth(config, api) {

	var self = this;
	var User = api.models.User;

	// Hash password and delete property if any
	User.schema.pre('save', function(next) {
		var user = this;
		var password = user.auth.local.password;
		if(password) {
			bcrypt.hash(password, self.rounds, function(err, hash) {
				if(err) return next(err);
				delete user.auth.local.password;
				user.auth.local.hash = hash;
				user.markModified('auth');
				next();
			})
		} else return next();
	});

	api.auth.registerAuthStrategy('local', {
		
		authenticate: function(username, password, cb) {
			User.findOne({'auth.local.username': username}, function(err, user) {
				if(err) return cb(err);
				if(user) {
					try {
						bcrypt.compare(password, user.auth.local.hash, function(err, res) {
							if(err) return cb(err);
							if(res) return cb(null, user);
							return cb(null, false);
						});
					} catch(err) {
						return cb(err);
					}
				} else return cb(null, false);
			});
		},

		register: function(username, password, cb) {}

	});

}

module.exports = exports = {

	init: function(pluginOpts, api, cb) {
		this.rounds = pluginOpts.rounds || 8;
		api.hook('app:beforeAuth', initAuth.bind(this));
		process.nextTick(cb);
	}

}