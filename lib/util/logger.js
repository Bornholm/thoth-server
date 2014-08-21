/* jshint node: true */
var bunyan = require('bunyan');
var config = require('./config');
var _ = require('lodash');

var loggerSettings = _.cloneDeep(config.get('logger'));
loggerSettings.serializers = bunyan.stdSerializers;

module.exports = bunyan.createLogger(loggerSettings);