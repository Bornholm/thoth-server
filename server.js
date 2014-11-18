/* jshint node: true */
var Thoth = require('./lib/thoth');
var logger = require('./lib/util/logger');
var Promise = require('bluebird');

function logAndExit(err) {
  logger.fatal(err);
  process.exit(1);
}

process.on('uncaughtException', logAndExit);
Promise.onPossiblyUnhandledRejection(logAndExit);

new Thoth()
  .startServer();
