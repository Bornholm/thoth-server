(function(w) {

    "use strict";
    var angular = w.angular;

    angular.module('Thoth')
        .factory('$auth', ['$http', function($http) {
            return {

                ping: function() {
                    return $http.get('/api/auth/ping');
                },

                login: function(username, password) {
                    var encoded = w.btoa(username + ':' + password);
                    $http.defaults.headers.common.Authorization = 'Basic ' + encoded;
                    return this.ping();
                },

                logout: function() {
                    $http.defaults.headers.common.Authorization = '';
                    return this.ping();
                }

            };
        }
    ]);

}(window));