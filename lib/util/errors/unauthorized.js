var util = require('util');

var UnauthorizedError = function(message) {
	Error.call(this);
	Error.captureStackTrace(this, this.constructor);
	this.name = "UnauthorizedError";
	this.message = message || "You don't have the permission to do this !";
	this.code = 2;
	this.status = 403;
};

util.inherits(UnauthorizedError, Error);

module.exports = UnauthorizedError;