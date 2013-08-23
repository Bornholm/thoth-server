(function(w) {

  "use strict";
  var angular = w.angular;

  angular.module('Thoth')
    .controller('NavBarCtrl', [
      '$scope', '$rootScope',
      '$auth', '$translate',
      function($scope, $rootScope, $auth, $translate) {

      $scope.isNavVisible = false;

      $scope.nav = [
        {
          label: 'NAVBAR.NEW_RECORD',
          icon: 'glyphicon-plus',
          href: '#/record/new',
          isVisible: true,
          isActive: false
        },
        {
          label: 'NAVBAR.PROFILE',
          icon: 'glyphicon-user',
          href: '#/profile',
          isVisible: true,
          isActive: false
        },
        {
          label: 'NAVBAR.ADMIN',
          icon: 'glyphicon-wrench',
          href: '#/admin',
          isVisible: false,
          isActive: false
        }
      ];

      $rootScope.$on('login', function() {
        $scope.isNavVisible = true;
      });

      $scope.logout = function() {
        $scope.isNavVisible = false;
        $auth.logout();
      };

    }]);

}(window))