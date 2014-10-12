/* jshint node: true */
var orm = require('../util/orm');

var NestedSet = orm.Model.extend({

  getChildren: function() {
    
  },

  getParent: function() {

  },

  addChild: function(child) {

  },

  removeChild: function(child) {

  },

  getPath: function() {

  }

});

orm.model('NestedSet', NestedSet);

module.exports = NestedSet;
