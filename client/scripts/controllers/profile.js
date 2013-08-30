(function(w) {

  "use strict";
  var angular = w.angular;

  angular.module('Thoth')
    .controller('ProfileCtrl', [
      '$scope', '$auth', '$notifications',
      function($scope, $auth, $notifs) {

        $scope.user = $auth.user;

        var unwatch;
        function detectModification(newVal, oldVal) {
          if(oldVal !== newVal) {
            $scope.saveRequired = true;
          }
        };
        
        function startWatchingChange() {
          unwatch = $scope.$watch(
            'user.name + user.email + user.permissions',
            detectModification
          );
        }

        function saveHandler() {
          $notifs.add('Sauvegardé !', '', $notifs.SUCCESS);
          $scope.saveRequired = false;
          startWatchingChange();
        }

        $scope.save = function() {
          if(typeof unwatch === 'function') {
            unwatch();
          }
          $scope.user.$update(saveHandler);
        };

        startWatchingChange();

      }
    ]);

}(window))