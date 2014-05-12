var util = require('util');

var DuplicateKeyError = function(mongoErr) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'DuplicateKeyError';
  this.message = 'One of your model field as a unique constraint and already exists into your database !';
  this.status = 500;
};

util.inherits(DuplicateKeyError, Error);

module.exports = DuplicateKeyError;