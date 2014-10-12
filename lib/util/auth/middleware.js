var basicAuth = require('basic-auth');
var Promise = require('bluebird');
var _ = require('lodash');
var logger = require('../logger');
var AuthBackendError = require('../errors').AuthBackendError;

module.exports = function authMiddleware(backends) {

  return function authenticate(req, res, next) {

    var credentials = basicAuth(req);

    if(!credentials || !('name' in credentials) || !('pass' in credentials)) {
      return unauthorized(res);
    }

    var backendPromises = _.map(backends, backendsMapper);
    var authPromise = Promise.any(backendPromises);

    var isAuthenticated = false;
    authPromise.then(authUserHandler)
      .catch(authErrorHandler)
      .finally(authFinalHandler);

    // Internal methods

    function backendsMapper(authFn) {
      return authFn(credentials);
    }

    function unauthorized() {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.status(401).end();
    }

    function authUserHandler(user) {
      if(user) {
        req.user = user;
        isAuthenticated = true;
        return next();
      }
    }

    function authErrorHandler(err) {
      logger.error(err);
      return next(new AuthBackendError());
    }

    function authFinalHandler() {
      if(!isAuthenticated && !authPromise.isRejected()) {
        return unauthorized();
      }
    }

  };

};
