var mongoose = require('mongoose');
var updatedAt = require('./plugins/updated-at');
var createdAt = require('./plugins/created-at');
var Schema = mongoose.Schema;
var Types = Schema.Types;

var schema = new Schema({
  type: {
    type: String,
    default: 'Tag'
  },
  label: {
    type: String,
    unique: true
  },
  description: String
});

schema.plugin(createdAt, {index: true});
schema.plugin(updatedAt, {index: true});

module.exports = exports = mongoose.model('Tag', schema);