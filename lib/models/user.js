/* jshint node: true */
var orm = require('../util/orm');

var User = orm.Model.extend({

  tableName: 'users',
  hasTimestamps: true

});

orm.model('User', User);

module.exports = User;
