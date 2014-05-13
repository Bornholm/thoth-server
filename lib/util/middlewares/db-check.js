var DisconnectedDbError = require('../errors/disconnected-db');

module.exports = function DbCheckMiddleware(conn) {
  return function(req, res, next) {
    if(conn._readyState === 1) {
      return next();
    } else {
      return next(new DisconnectedDbError());
    }
  }
}