var ArmatureError = require('armature').Error;

function unauthorized(res, realm, ajaxMode, next) {
  res.set('WWW-Authenticate', (ajaxMode ? 'x': '') + 'Basic realm="' + realm + '"');
  return next(new ArmatureError({
  	name: 'UnauthorizedError',
		status: 401,
		message: 'You are not authorized to access this resource.'
	}));
};

module.exports = exports = function basicAuthMiddleware(callback, realm) {

  return function(req, res, next) {

  	var authorization = req.headers.authorization;

	  var ajaxMode = req.get('X-Requested-With') === 'XMLHttpRequest';

	  if (req.user) {
	  	return next();
	  }
	  if (!authorization) {
	  	return unauthorized(res, realm, ajaxMode, next);
	  }

	  var parts = authorization.split(' ');

	  if (parts.length !== 2) {
			return next(new ArmatureError({
				name: 'InvalidAuthorizationScheme',
				status: 400
	  	}));
		}

	  var scheme = parts[0]
	  var credentials = new Buffer(parts[1], 'base64').toString()
	  var index = credentials.indexOf(':');

	  if ('Basic' != scheme || index < 0) {
	  	return next(new ArmatureError({
	  		name: 'InvalidAuthorizationScheme',
				status: 400
	  	}));
	  }
	  
	  var user = credentials.slice(0, index)
	  var pass = credentials.slice(index + 1);

	  callback(user, pass, function(err, user){
      if (err || !user)  {
      	return unauthorized(res, realm, ajaxMode, next);
      }
      req.user = user;
      next();
    });
  }
  
}