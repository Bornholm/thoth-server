var util = require('util');

var DisconnectedDbError = function() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'DisconnectedDbError';
  this.message = 'Unable to connect to database !';
  this.status = 500;
};

util.inherits(DisconnectedDbError, Error);

module.exports = DisconnectedDbError;