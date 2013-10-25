(function(w) {

  "use strict";
  var angular = w.angular;

  angular.module('Thoth')
    .controller('AdminCtrl', [
      '$scope', 'lightRest',
      function($scope, $rest) {

        $rest.get('/api/users').then(function(data) {
          $scope.users = data;
        });
        
        $rest.get('/api/roles').then(function(data) {
          $scope.roles = data;
        });

        $rest.get('/api/tags').then(function(data) {
          $scope.tags = data;
        });
      }
    ]);

}(window))