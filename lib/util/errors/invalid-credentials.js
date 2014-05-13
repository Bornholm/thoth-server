var util = require('util');

var InvalidCredentialsError = function() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = "InvalidCredentialsError";
  this.message = "Your credentials are invalid";
  this.status = 401;
};

util.inherits(InvalidCredentialsError, Error);

module.exports = InvalidCredentialsError;