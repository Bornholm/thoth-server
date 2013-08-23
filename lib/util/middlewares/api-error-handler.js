module.exports = exports = function(err, req, res, next) {
	this.logger.error(err.stack);
	res.status(err.status ? err.status : 500);
	res.send(err);
};