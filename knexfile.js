var config = require('./lib/util/config');

module.exports = {
  development: config.get('database'),
  staging: config.get('database'),
  production: config.get('database')
};