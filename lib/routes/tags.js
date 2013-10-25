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
    update: function(newTag, fields) {
      if(fields.label) {
        newTag.label = fields.label;
        if(fields.description) {
          newTag.description = fields.description;
        }
      } else {
        throw new InvalidRequestError();
      }
    }
  }));

};