var config = require('./config');
var Promise = require('bluebird');
var knex = require('knex')(config.get('database'));
var orm = require('bookshelf')(knex);

function crash(err) {
  logger.fatal(err, 'Unhandled Error');
  process.exit(1);
}

Promise.onPossiblyUnhandledRejection(crash);

orm.plugin('registry');
orm.plugin('virtuals');
orm.plugin('visibility');

module.exports = orm;