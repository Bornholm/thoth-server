(function(w) {

  "use strict";
  var angular = w.angular;
  var _ = w._;

  var deps = [];

  function PluckFilter() {
    return _.memoize(function(input, field) {
      if(Array.isArray(input)) {
        return input.map(function(item) {
          return item[field];
        });
      } else if(input) {
        return input[field];
      }
    });
  }

  PluckFilter.$inject = deps;

  angular.module('Thoth')
      .filter('pluck', PluckFilter);

}(window));