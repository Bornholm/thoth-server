/* jshint node: true */
var orm = require('../util/orm');

var Permission = orm.Model.extend({

  tableName: 'permissions',
  hasTimestamps: true,

  hidden: [
    'role_id'
  ],

  role: function() {
    return this.belongsTo('Role');
  }

});

orm.model('Permission', Permission);

module.exports = Permission;
