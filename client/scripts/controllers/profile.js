(function(w) {

  "use strict";
  var angular = w.angular;

  var deps = [
    '$scope', '$auth', '$notifications', 
    'lightRest',
    '$translate', 'config', 'pluckFilter'
  ];

  function ProfileCtrl(
    $scope, $auth, $notifs,
    $rest, $translate, config, pluck
  ) {

    $rest
      .get('/users/me')
      .then(function(user) {
        $scope.user = $auth.user = user;
        user.roles = pluck(user.roles, 'name');
      });

    $scope.lang = {
      key: $translate.uses()
    };

    $scope.availableLanguages = config.languages.available.map(function(l) {
      return {key: l, label: $translate('LANG.'+l.toUpperCase())}
    });

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