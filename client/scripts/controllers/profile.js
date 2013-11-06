(function(w) {

  "use strict";
  var angular = w.angular;

  var deps = [
    '$scope', '$auth', '$notifications', 
    '$routeParams', 'lightRest',
    '$translate'
  ];

  function ProfileCtrl($scope, $auth, $notifs, $routeParams, $rest, $translate) {

    var userId = $routeParams.userId;

    $scope.watchingExp = 'user.name + user.email + user.permissions + user.roles';

    if(userId === 'me') {
      $rest.get('/api/users/:userId', {userId: userId})
        .then(function(user) {
          $auth.user = $scope.user = user;
          $scope.$broadcast('start-watching');
        });
    } else {
      $rest.get('/api/users/:userId', {userId: userId})
        .then(function(user) {
          $scope.user = user;
          $scope.$broadcast('start-watching');
        });
    }

    $scope.isAdmin = $auth.isAdmin;

    function saveHandler() {
      $notifs.add($translate('GLOBAL.SAVED'), '', $notifs.SUCCESS);
      $scope.$broadcast('reset-watching');
    }

    $scope.save = function() {
      $scope.$broadcast('stop-watching');
      $rest.put('/api/users/:_id', $scope.user)
        .then(saveHandler, $scope.serverErrorHandler);
    };

    $scope.canDelete = function() {
      return '_id' in $scope.user && $auth.user._id !== $scope.user._id;
    };

    $rest.get('/api/roles')
      .then(function(roles) {
        $scope.rolesAvailable = roles;
      });


    $scope.availableLanguages = [
      {key: 'fr', label: $translate('LANG.FR')},
      {key: 'en', label: $translate('LANG.EN')}
    ];

    $scope.$watch('lang', function(lang) {
      if(lang && lang.key) {
        $translate.uses(lang.key);
      }
    });

  }

  ProfileCtrl.$inject = deps;

  angular.module('Thoth')
    .controller('ProfileCtrl', ProfileCtrl);

}(window))