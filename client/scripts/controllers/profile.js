(function(w) {

  "use strict";
  var angular = w.angular;

  angular.module('Thoth')
    .controller('ProfileCtrl', [
      '$scope', '$auth', '$notifications', 
      '$routeParams', '$api',
      function($scope, $auth, $notifs, $routeParams, $api) {

        var userId = $routeParams.userId;

        if(userId === 'me') {
          $scope.user = $auth.user;
          startWatchingChange();
        } else {
          $api.User.get({userId: userId}, function(data) {
            $scope.user = data;
            startWatchingChange();
          });
        }

        $scope.isAdmin = $auth.isAdmin;

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

      }
    ]);

}(window))