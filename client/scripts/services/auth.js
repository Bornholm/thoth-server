(function(w) {

    "use strict";
    var angular = w.angular;

    angular.module('Thoth')
        .factory('$auth', [
            '$rootScope', '$http', '$cookieStore', '$api', '$q',
            function($rootScope, $http, $cookieStore, $api, $q) {

              var auth = {};

              auth.ping = function() {
                  return $http.get('/api/auth/ping')
                    .then($rootScope.$broadcast.bind($rootScope, 'login'));
              };

              auth.login = function(username, password) {
                var encoded = w.btoa(username + ':' + password);
                $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                var deferred = $q.defer();
                $api.User.me(function(user) {
                  auth.user = user;
                  $rootScope.$broadcast('login');
                  return deferred.resolve(user);
                }, deferred.reject);
                return deferred.promise;
              };

              auth.logout = function() {
                  var encoded = w.btoa('bye:bye');
                  $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                  return $http.get('/api/auth/logout');
              }

              return auth;
            }
          ]
        );

}(window));