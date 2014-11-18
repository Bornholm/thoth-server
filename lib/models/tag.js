/* jshint node: true */
var orm = require('../util/orm');

var Tag = orm.Model.extend({

  tableName: 'tags',
  hasTimestamps: true,

  records: function() {
    return this.belongsToMany('Record');
  }

});

orm.model('Tag', Tag);

module.exports = Tag;
