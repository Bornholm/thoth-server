(function(w) {

  "use strict";
  var angular = w.angular;

  angular.module('Thoth')
    .controller('ProfileCtrl', [
      '$scope', '$auth', '$notifications', 
      '$routeParams', 'lightRest',
      function($scope, $auth, $notifs, $routeParams, $rest) {

        var userId = $routeParams.userId;

        if(userId === 'me') {
          $rest.get('/api/users/:userId', {userId: userId})
            .then(function(user) {
              $auth.user = $scope.user = user;
            }, $scope.serverErrorHandler)
            .then(startWatchingChange);
        } else {
          $rest.get('/api/users/:userId', {userId: userId})
            .then(function(user) {
              $scope.user = user;
            }, $scope.serverErrorHandler)
            .then(startWatchingChange);
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
            'user.name + user.email + user.permissions + user.roles',
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
          $rest.put('/api/users/:_id', $scope.user)
            .then(saveHandler, $scope.serverErrorHandler);
        };

        $rest.get('/api/roles')
          .then(function(roles) {
            $scope.rolesAvailable = roles;
          }, $scope.serverErrorHandler);

      }
    ]);

}(window))