var async = require('async');
var _ = require('lodash');

var auth = {};

var backends = {};
auth.registerAuthBackend = function(authType, backend) {
	backends[authType] = backend;
};

auth.getAuthBackend = function(authType) {
	return backends[authType];
}

auth.authenticate = function(username, password, cb) {
  var user;
  var pairs = _.pairs(backends);
  var backendIndex = 0;
  async.until(
    function userFoundOrNoMoreBackend() {
      return user || backendIndex >= pairs.length;
    },
    function useBackend(next) {
      var p = pairs[backendIndex++];
      var backend = p[1];
      if(backend && typeof backend.authenticate === 'function') {
        try {
          return backend.authenticate(username, password, function(err) {
            if(err) {
              return next(err);
            }
            user = arguments[1];
            return next();
          });
        } catch(err) {
          return next(err);
        }
      } else {
        return next(
          new Error('Backend ' + p[0] + 'has no authenticate method !')
        );
      }
    },
    function(err) {
      if(err) {
        return cb(err);
      }
      return cb(null, user);
    }
  );
  return auth;
};

module.exports = exports = auth;