/* jshint node: true */
var orm = require('../util/orm');

var User = orm.Model.extend({

  tableName: 'users',
  hasTimestamps: true,

  hidden: [
    'password_hash'
  ],

  roles: function() {
    return this.belongsToMany('Role');
  },

  records: function() {
    return this.hasMany('Record');
  }

});

orm.model('User', User);

module.exports = User;
