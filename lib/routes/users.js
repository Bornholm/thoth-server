var User = require('../models/user');
var ops = require('../util/ops');
var helpers = require('../util/helpers');
var check = require('validator').check;
var UnauthorizedError = require('../util/errors/unauthorized');
var InvalidRequestError = require('../util/errors/invalid-request');
var UnknownResourceError = require('../util/errors/unknown-resource');

module.exports = exports = function(app, api) {

	// GET /api/users/me -> Current user
	app.get('/users/me', function(req, res, next) {
    var user = req.user;
    User.populate(
      user,
      [{ path: 'roles', select: 'name' }],
      function(err, user) {
        if(err) {
          return next(err);
        }
        res.send(user.without('auth'));
      }
    );
	});

};
