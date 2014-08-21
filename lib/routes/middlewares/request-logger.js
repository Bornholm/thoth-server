/* jshint node: true */
var mainLogger = require('../../util/logger');
var uuid = require('node-uuid');

module.exports = function requestLogger() {

  return function(req, res, next) {
    
    // On assigne un UUID à chaque requete pour pouvoir les retracer dans les logs
    req.id = uuid.v4();
    
    req.logger = mainLogger.child({
      reqId: req.id
    });
    
    req.logger.info({req: req}, 'Request');
    
    return next();
    
  };

};