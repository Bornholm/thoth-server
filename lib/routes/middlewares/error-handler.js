/* jshint node: true */

module.exports = function errorHandler() {

  return function(err, req, res, next) {
    req.logger[err.status ? 'warn' : 'error']({err: err}, 'Request Error');
    return res.status(err.status || 500)
      .send({
        error: {
          name: err.name,
          message: err.message
        }
      });
  };

};
