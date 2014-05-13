var util = require('util');

var UnknownResourceError = function(message) {
	Error.call(this);
	Error.captureStackTrace(this, this.constructor);
	this.name = "UnknownResourceError";
	this.message = message || "The specified resource is inexistent.";
	this.status = 404;
};

util.inherits(UnknownResourceError, Error);

module.exports = UnknownResourceError;