var express = require('express');
var exports = module.exports = express();
var dummyCtrl = require('../controllers').dummy;

exports.get('/dummy', dummyCtrl.getDummy);
exports.get('/dummy-error', dummyCtrl.dummyError);
