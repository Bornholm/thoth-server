module.exports = exports = function(err, req, res, next) {
  var env = process.env.NODE_ENV;
  this.logger.error(err.stack ? err.stack : err);
	res.status(err.status ? err.status : 500);
  res.send({
    error: err.name || 'UnknownError',
    debug: env === 'development' ? err : undefined
  });
};