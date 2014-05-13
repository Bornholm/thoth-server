(function(w) {

  "use strict";
  var angular = w.angular;
  var async = w.async;
  var _ = w._;

  var deps = [
    '$scope'
  ];

  function ButtonBarCtrl($scope) {

    $scope.saveRequired = false;

    $scope.$on('start-watching', startWatchingChange);
    $scope.$on('stop-watching', stopWatchingChange);
    $scope.$on('reset-watching', resetWatching);

    var unwatch;
    function startWatchingChange() {
      unwatch = $scope.$watch(
        $scope.watchingExp,
        detectModification
      );
    }

    function stopWatchingChange() {
      if(typeof unwatch === 'function') {
        unwatch();
      }
      unwatch = null;
    }

    function detectModification(newVal, oldVal) {
      if(oldVal !== newVal) {
        $scope.saveRequired = true;
        $scope.$emit('save-required', newVal);
      }
    };

    function resetWatching() {
      $scope.saveRequired = false;
      stopWatchingChange();
      startWatchingChange();
    };

  }

  ButtonBarCtrl.$inject = deps;

  angular.module('Thoth')
    .controller('ButtonBarCtrl', ButtonBarCtrl);

}(window))