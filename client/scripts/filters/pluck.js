(function(w) {

  "use strict";
  var angular = w.angular;
  var _ = w._;
  var btoa = w.btoa;

  var deps = [];

  var slice = Array.prototype.slice;

  function hash() {
    var args = slice.call(arguments);
    return btoa(args.join(':'));
  };

  function PluckFilter() {
    return _.memoize(function(input, field) {
      if(Array.isArray(input)) {
        return input.map(function(item) {
          return item[field];
        });
      } else if(input) {
        return input[field];
      }
    }, hash);
  }

  PluckFilter.$inject = deps;

  angular.module('Thoth')
      .filter('pluck', PluckFilter);

}(window));