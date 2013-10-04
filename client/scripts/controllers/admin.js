(function(w) {

  "use strict";
  var angular = w.angular;

  angular.module('Thoth')
    .controller('AdminCtrl', [
      '$scope', '$api',
      '$auth',
      function($scope, $api, $auth) {
        
        $scope.users = $api.User.query();

        $scope.roles = $api.Role.query();

      }
    ]);

}(window))