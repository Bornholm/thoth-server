module.exports = function(opts) {

  opts = opts || {};
  var logger = opts.logger || console;

  function logRequest(req, res) {
    logger.info('Request', {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.headerSent ? res.statusCode : null,
      remoteAddress: req.socket.remoteAddress,
      user: req.user ? req.user.email : null
    });
  }

  return function(req, res, next) {
    res.once('finish', logRequest.bind(null, req, res));
    process.nextTick(next);
  };

}