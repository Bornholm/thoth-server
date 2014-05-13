var util = require('util');

var InvalidAuthSchemeError = function() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = "InvalidAuthSchemeError";
  this.message = "Invalid authorization scheme";
  this.status = 400;
};

util.inherits(InvalidAuthSchemeError, Error);

module.exports = InvalidAuthSchemeError;