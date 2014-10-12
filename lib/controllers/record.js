/* jshint node: true */
var http = require('http');
var url = require('url') ;
var Record = require('../models').Record;

exports.createOne = function(req, res, next) {

  var record = new Record();

  record.set('label', 'test');

  record.save()
    .then(function() {
      var hostname = req.headers.host;
      var pathname = url.parse(req.originalUrl).pathname;
      var resourcePath = req.protocol + '://' +
        hostname + pathname + '/' +
        + record.get('id')
      ;
      res.set('Location', resourcePath);
      res.status(201).end();
    })
    .catch(next);

};

exports.fetchOne = function(req, res, next) {

  var id = req.param('id');

  new Record({id: id})
    .fetch({
      withRelated: ['category', 'tags', 'author']
    })
    .then(function(record) {
      if(record) {
        res.status(200).send(record);
      } else {
        res.status(404).end();
      }
    })
    .catch(next);

  function renderRecords(records) {
    res.send(records);
  }

};

exports.fetchAll = function(req, res, next) {

  Record.fetchAll({
      withRelated: ['category', 'tags', 'author']
    })
    .then(function(records) {
      res.status(200).send(records);
    })
    .catch(next);

}
