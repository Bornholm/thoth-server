/* jshint node: true */
var orm = require('../util/orm');
var NestedSet = require('./nested-set');

var Category = NestedSet.extend({

  tableName: 'categories',
  hasTimestamps: true,

  records: function() {
    return this.hasMany('Record');
  }

});

orm.model('Category', Category);

module.exports = Category;
