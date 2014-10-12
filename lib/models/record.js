/* jshint node: true */
var orm = require('../util/orm');

var Record = orm.Model.extend({

  tableName: 'records',
  hasTimestamps: true,
  hidden: [
    'category_id',
    'user_id'
  ],

  tags: function() {
    return this.belongsToMany('Tag');
  },

  category: function() {
    return this.belongsTo('Category');
  },

  author: function() {
    return this.belongsTo('User');
  }

});

orm.model('Record', Record);

module.exports = Record;
