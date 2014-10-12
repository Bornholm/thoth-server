/* jshint node: true */
var util = require('util');

var DummyError = function() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'DummyError';
  this.message = 'This is a dummy error !';
  this.status = 500;
};

util.inherits(DummyError, Error);

module.exports = DummyError;
