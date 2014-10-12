/* jshint node: true */
var util = require('util');

var AuthBackendError = function() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'AuthBackendError';
  this.message = 'An error occured with one of the authentication backend.';
  this.status = 500;
};

util.inherits(AuthBackendError, Error);

module.exports = AuthBackendError;
