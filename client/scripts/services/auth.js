(function(w) {

    "use strict";
    var angular = w.angular;

    angular.module('Thoth')
        .factory('$auth', [
            '$rootScope', '$http', '$cookieStore', 'lightRest', '$q',
            function($rootScope, $http, $cookieStore, $rest, $q) {

              var auth = {};

              auth.ping = function() {
                return $rest.get('/auth/ping')
                  .then($rootScope.$broadcast.bind($rootScope, 'login'));
              };

              auth.login = function(username, password) {
                var encoded = w.btoa(username + ':' + password);
                $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                var deferred = $q.defer();
                $rest.get('/users/me').then(function(user) {
                  auth.user = user;
                  $rootScope.$broadcast('login');
                  deferred.resolve(user);
                }, deferred.reject);

                return deferred.promise;
              };

              auth.logout = function() {
                var encoded = w.btoa('bye:bye');
                $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                return $http.get('/auth/logout');
              };

              return auth;
            }
          ]
        );

}(window));