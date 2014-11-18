/* jshint node: true */
var http = require('http');
var url = require('url') ;
var Record = require('../models').Record;

exports.createOne = function(req, res, next) {

  var data = req.body;

  var record = new Record({
    label: data.label,
    text: data.text,
    user_id: req.user.id
  });

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
      withRelated: ['category', 'tags', 'user']
    })
    .then(function(record) {
      if(record) {
        res.status(200).send(record.toJSON({virtuals: true}));
      } else {
        res.status(404).end();
      }
    })
    .catch(next);

};

exports.fetchAll = function(req, res, next) {

  var limit = req.param('limit') || 10;
  var offset = req.param('skip') || 0;

  Record.query({
      limit: limit,
      offset: offset
    })
    .fetchAll({
      withRelated: [
        { category: function(qb) { qb.column('label', 'id');} },
        { tags: function(qb) { qb.column('tags.label', 'tags.id');} },
        { user: function(qb) { qb.column('name', 'id');} }
      ]
    })
    .then(function(records) {
      res.status(200).send(records);
    })
    .catch(next);

}
