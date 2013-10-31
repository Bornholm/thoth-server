var mongoose = require('mongoose');
var lastUpdate = require('./plugins/last-update');
var creationDate = require('./plugins/creation-date');
var Schema = mongoose.Schema;
var Types = Schema.Types;

var schema = new Schema({
  type: {
    type: String,
    default: 'Tag'
  },
  label: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: String
});

schema.plugin(lastUpdate, {index: true});
schema.plugin(creationDate, {index: true});

module.exports = exports = mongoose.model('Tag', schema);