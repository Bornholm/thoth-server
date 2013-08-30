module.exports = exports = function(err, req, res, next) {
  if(!err.status || err.status === 500) {
    this.logger.error(err.stack);
  }
	res.status(err.status ? err.status : 500);
	res.send(err);
};