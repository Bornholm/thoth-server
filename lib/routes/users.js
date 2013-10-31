var User = require('../models/user');
var Role = require('../models/plugins/resources-access').Role;
var ops = require('../util/ops');
var helpers = require('../util/helpers');
var check = require('validator').check;
var UnauthorizedError = require('../util/errors/unauthorized');
var InvalidRequestError = require('../util/errors/invalid-request');
var UnknownResourceError = require('../util/errors/unknown-resource');

module.exports = exports = function(app, api) {

	// GET /api/users/me -> Current user
	app.get('/users/me', function(req, res) {
		res.send(req.user.without('auth'));
	});

	// GET /api/users/<userId> -> User
	app.get('/users/:userId', function(req, res, next) {

		var user = req.user;
		var userId = req.params.userId;

		try {
			userId && check(userId, 'record id parameter must be an alphanumeric string.').isAlphanumeric();
		} catch(err) {
			return next(err);
		}
		
		User.findById(userId, function(err, qUser){
			if(err) {
				return next(err);
			}
			if(qUser) {
				user.hasPermission(ops.READ, qUser, function(err, isAllowed) {
					if(err) {
						return next(err);
					}
					if(isAllowed) {
						return res.send(qUser.without('auth'));
					} else {
						return next(new UnauthorizedError());
					}
				});
			} else {
				return next(new UnknownResourceError());
			}
		});

	});

	// GET /api/users(?skip=<skip_results>)(&limit=<limit_results>)(&search=<search_filter) -> [User...]
	app.get(
		'/users', 
		helpers.getModelQueryHandler(User, {
			searchFields: ['name', 'email'],
			hiddenFields: ['auth'],
			accessFilter: {type: 'User'}
		})
	);


	app.put('/users/:id', helpers.getModelUpdateHandler(User, {
		update: function(user, update, done) {

			if('name' in update) {
				user.name = update.name;
			}

			if('email' in update) {
				user.email = update.email;
			}

			if('roles' in update) {
				if(update.roles.length) {
					var q = {
						name: {
							$in: update.roles
						}
					};
					Role.count(q, function(err, count) {
						if(err) {
							return done(err);
						}
						if(count === update.roles.length) {
							user.roles = update.roles;
							return done();
						} else {
							return done(new InvalidRequestError('Invalid roles !'));
						}
					});
				} else {
					user.roles = [];
					return done();
				}
			} else {
				return done();
			}

		},
		transform: function(user, done) {
			return done(null, user.without('auth'));
		}
	}));

};
