var util = require('util');

var InvalidRequestError = function(message) {
	Error.call(this);
	Error.captureStackTrace(this, this.constructor);
	this.name = "InvalidRequestError";
	this.message = message || "Your request is malformed or invalid !";
	this.code = 3;
	this.status = 400;
};

util.inherits(InvalidRequestError, Error);

module.exports = InvalidRequestError;