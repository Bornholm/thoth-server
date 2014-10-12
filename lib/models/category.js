/* jshint node: true */
var orm = require('../util/orm');
var NestedSet = require('./nested-set');

var Category = NestedSet.extend({

  tableName: 'categories',
  hasTimestamps: true

});

orm.model('Category', Category);

module.exports = Category;
