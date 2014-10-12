/* jshint node: true */
var config = require('./lib/util/config');
var logger = require('./lib/util/logger');
var Promise = require('bluebird');

function crash(err) {
  logger.fatal(err, 'Unhandled Error');
  process.exit(1);
}

Promise.onPossiblyUnhandledRejection(crash);

logger.info('Starting');

// Start listening

var api = require('./lib/routes');

api.listen(
  config.get('server:port'),
  config.get('server:host'),
  function(err) {
    if(err) {
      logger.fatal(err);
      return process.exit(1);
    }
    logger.info(config.get('server'), 'Listening');
  }
);
