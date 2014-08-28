/* jshint node: true */
var orm = require('../util/orm');

var Dummy = orm.Model.extend({

  tableName: 'dummy'

});

orm.model('Dummy', Dummy);

module.exports = Dummy;
