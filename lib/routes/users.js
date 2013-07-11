var User = require('../models/user');
var ops = require('../util/ops');
var check = require('validator').check;

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
		
		User.findOne({_id: userId}, function(err, qUser){
			if(err) return next(err);
			if(qUser) {
				var isAllowed = user.hasPermission(ops.READ, qUser);
				if(isAllowed) {
					return res.send(qUser.without('auth'));
				} else return next(new UnauthorizedError());
			} else return next(new UnknownResourceError());
		});

	});

	// GET /api/users(?skip=<skip_results>)(&limit=<limit_results>)(&search=<search_filter) -> [User...]
	app.get('/users', function(req, res) {

		var user = req.user;
		var skip = req.param('skip') || 0;
		var limit = req.param('limit') || 0;
		var search = req.param('search');

		try {
			skip && check(+skip, 'skip parameter must be a positive integer.').isNumeric().min(0);
			limit && check(+limit, 'limit parameter must be a positive integer.').isNumeric().min(0);
			search && check(search, 'search parameter must be an alphanumeric text.').is(/[^\*\(\)\{\}]/i);
		} catch(err) {
			return next(err);
		}

		var isAllowed = user.hasPermission(ops.READ, {type: 'User'});
		if(isAllowed) {
			var q = User.find()
			skip && q.skip(skip);
			limit && q.limit(limit);
			if(search) {
				var or = [];
				var tokens = search.split(' ');
				if(tokens.length) {	
					or.push({
						name: new RegExp(tokens.join('|'), 'i')
					});
					or.push({
						email: new RegExp(tokens.join('|'), 'i')
					});
				}
				q.or(or);
			}
			q.exec(function(err, users) {
				if(err) return next(err);
				var results = users.filter(function(u) {
					return user.hasPermission(ops.READ, u);
				});
				results = users.map(function(u) {
					return u.without('auth');
				});
				return res.send(results);
			});
		} else return next(new UnauthorizedError());

	});

	

};
