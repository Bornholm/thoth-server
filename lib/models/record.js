var mongoose = require('mongoose');
var lastUpdate = require('./plugins/last-update');
var creationDate = require('./plugins/creation-date');
var encrypt = require('./plugins/encrypt');
var without = require('./plugins/without');
var revision = require('./plugins/revision');
var Schema = mongoose.Schema;
var Types = Schema.Types;

var schema = new Schema({
	label: String,
	category: {
    type: [String],
    required: true
  },
  tags: {
    type: [String]
  },
	text: String,
	creator: {
		type: Types.ObjectId,
		required: true,
		ref: 'User'
	}
});

schema.methods.getIncludingCategories = function() {
  var categories = [];
  var i = this.category.length;
  do {
    var cat = this.category.slice(0, i);
    if(cat.length) {
      categories.push(cat);
    }
  } while(i--);
  return categories;
};

schema.plugin(lastUpdate, {index: true});
schema.plugin(creationDate, {index: true});
schema.plugin(without);
schema.plugin(revision);
schema.plugin(encrypt, {
	fields: ['text']
});


module.exports = exports = mongoose.model('Record', schema);