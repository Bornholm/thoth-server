(function(w) {

    "use strict";
    var angular = w.angular;

    angular.module('Thoth')
        .factory('$api', ['$resource', function($resource) {

            var rootUrl = '/api'
            var api = {};

            api.Record = $resource(
                rootUrl + '/records/:id',
                {'id': '@_id'},
                {
                    update: {method: 'PUT'}
                }
            );

            api.User = $resource(
                rootUrl + '/users/:id',
                {'id': '@_id'},
                {
                    update: {method: 'PUT'},
                    me: {method: 'GET', params: {'id': 'me'}}
                }
            );

            return api;
        }
    ]);

}(window));