/* jshint node: true */
var orm = require('../util/orm');

var Role = orm.Model.extend({

  tableName: 'roles',
  hasTimestamps: true,

  permissions: function() {
    return this.hasMany('Permission');
  },

  users: function() {
    return this.belongsToMany('User');
  },

});

orm.model('Role', Role);

module.exports = Role;
