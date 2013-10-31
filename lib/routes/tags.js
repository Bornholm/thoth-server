var Tag = require('../models/tag');
var ops = require('../util/ops');
var helpers = require('../util/helpers');
var check = require('validator').check;
var UnauthorizedError = require('../util/errors/unauthorized');
var InvalidRequestError = require('../util/errors/invalid-request');
var UnknownResourceError = require('../util/errors/unknown-resource');

module.exports = function(app, api) {


  app.get(
    '/tags', 
    helpers.getModelQueryHandler(Tag, {
      searchFields: ['label', 'description'],
      accessFilter: {type: 'Tag'}
    })
  );

  app.post('/tags', helpers.getModelCreateHandler(Tag, {
    update: function(newTag, fields, done) {
      if(fields.label) {
        newTag.label = fields.label;
        if(fields.description) {
          newTag.description = fields.description;
        }
        return done();
      } else {
        return done(new InvalidRequestError());
      }
    }
  }));

  app.put('/tags/:id', helpers.getModelUpdateHandler(Tag, {
    update: function(tag, fields, done) {
      if(fields.label) {
        tag.label = fields.label;
        if(fields.description) {
          tag.description = fields.description;
        }
        return done();
      } else {
        return done(new InvalidRequestError());
      }
    }
  }));

  app.get('/tags/:id', helpers.getModelGetOneHandler(Tag));

};