var utils = require('express/node_modules/connect/lib/utils');

function unauthorized(res, realm, ajaxMode) {
  res.status(401);
  res.set('WWW-Authenticate', (ajaxMode ? 'x': '') + 'Basic realm="' + realm + '"');
  res.end('Unauthorized');
};

module.exports = exports = function basicAuthMiddleware(callback, realm) {

  return function(req, res, next) {

  	var authorization = req.headers.authorization;

	  var ajaxMode = req.get('X-Requested-With') === 'XMLHttpRequest';

	  if (req.user) return next();
	  if (!authorization) return unauthorized(res, realm, ajaxMode);

	  var parts = authorization.split(' ');

	  if (parts.length !== 2) return next(utils.error(400));

	  var scheme = parts[0]
	    , credentials = new Buffer(parts[1], 'base64').toString()
	    , index = credentials.indexOf(':');

	  if ('Basic' != scheme || index < 0) return next(utils.error(400));
	  
	  var user = credentials.slice(0, index)
	    , pass = credentials.slice(index + 1);

	  // async
	  if (callback.length >= 3) {
	    var pause = utils.pause(req);
	    callback(user, pass, function(err, user){
	      if (err || !user)  return unauthorized(res, realm, ajaxMode);
	      req.user = req.remoteUser = user;
	      next();
	      pause.resume();
	    });
	  // sync
	  } else {
	    if (callback(user, pass)) {
	      req.user = req.remoteUser = user;
	      next();
	    } else {
	      unauthorized(res, realm, ajaxMode);
	    }
	  }
  }
}