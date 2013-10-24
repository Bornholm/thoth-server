(function(w) {

  "use strict";
  var angular = w.angular;

  angular.module('Thoth')
    .controller('NavBarCtrl', [
      '$scope', '$rootScope',
      '$auth', '$api',
      '$translate', '$location',
      function($scope, $rootScope, $auth, $api, $translate, $location) {

      var adminItem = {
        label: 'NAVBAR.ADMIN',
        icon: 'glyphicon-wrench',
        href: '#/admin',
        isVisible: false,
        isActive: false
      };

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
          href: '#/profile/me',
          isVisible: true,
          isActive: false
        },
        adminItem
      ];

      $rootScope.$on('login', function() {
        $scope.isNavVisible = true;
      });

      $scope.logout = function() {
        $scope.isNavVisible = false;
        $auth.logout();
      };

      $scope.search = $location.search().search;
      $scope.doSearch = function() {
        $location.path('/home').search({search: $scope.search});
      };

      $scope.$auth = $auth;
      $scope.$watch('$auth.user', function(user) {
        adminItem.isVisible = $auth.isAdmin();
      });

    }]);

}(window))