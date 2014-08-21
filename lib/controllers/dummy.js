/* jshint node: true */

var DummyModel = require('../models').Dummy;
var DummyError = require('../errors').DummyError;

exports.getDummy = function(req, res, next) {

  req.logger.info('Dummy request');

  res.send(new DummyModel({hello: 'world'}));
  
};

exports.dummyError = function(req, res, next) {
  return next(new DummyError());
};
