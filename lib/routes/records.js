var express = require('express');
var exports = module.exports = express();
var recordCtrl = require('../controllers').record;

exports.get('/', recordCtrl.fetchAll);
exports.get('/:id', recordCtrl.fetchOne);
exports.post('/', recordCtrl.createOne);
