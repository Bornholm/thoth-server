
var InvalidCredentialsError = require('../errors/invalid-credentials');
var InvalidAuthSchemeError = require('../errors/invalid-auth-scheme');

function unauthorized(res, realm, ajaxMode, next) {
  var authHeader = 'WWW-Authenticate';
  if(ajaxMode) {
    authHeader = 'X-' + authHeader;
  }
  res.set(authHeader, 'Basic realm="' + realm + '"');
  return next(new InvalidCredentialsError());
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
			return next(new InvalidAuthSchemeError());
		}

	  var scheme = parts[0]
	  var credentials = new Buffer(parts[1], 'base64').toString()
	  var index = credentials.indexOf(':');

	  if ('Basic' != scheme || index < 0) {
	  	return next(new InvalidAuthSchemeError());
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