module.exports = exports = function(err, req, res, next) {
  var env = process.env.NODE_ENV;
  if(env === 'development') {
    this.logger.error(err.stack ? err.stack : err);
  } else {
    this.logger.warn(err);
  }
	res.status(err.status ? err.status : 500);
  if(env === 'development') {
    res.send(err);
  } else {
    res.send({
      error: err.name || 'UnknownError'
    });
  }
};