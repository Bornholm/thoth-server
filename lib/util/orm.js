var config = require('./config');
var Promise = require('bluebird');
var knex = require('knex')(config.get('database'));
var orm = require('bookshelf')(knex);
var logger = require('./logger');

orm.plugin('registry');
orm.plugin('virtuals');
orm.plugin('visibility');

module.exports = orm;
