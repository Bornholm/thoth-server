var config = require('./util/config');
var logger = require('./util/logger');
var Promise = require('bluebird');

function Thoth() {
  this.logger = logger;
  this.commands = require('./util/commands');
  this.auth = require('./util/auth');
}

module.exports = Thoth;

var p = Thoth.prototype;

// Public methods

p.startServer = function() {

  logger.info('Starting');

  // Start listening

  var api = require('./routes');

  var listen = Promise.promisify(api.listen, api);

  var port = config.get('server:port');
  var host = config.get('server:host');

  return listen(port, host)
    .then(function() {
      logger.info('Listening', {host: host, port: port});
    })
  ;

};

p.startCli = function() {
  this.commands.startCli();
  return this;
};
