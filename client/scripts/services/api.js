(function(w) {

    "use strict";
    var angular = w.angular;

    angular.module('Thoth')
        .factory('$api', ['$resource', function($resource) {

            var rootUrl = '/api'
            var api = {};

            api.Record = $resource(
                rootUrl + '/records/:recordId',
                {'recordId': '@_id'},
                {
                    update: {method: 'PUT'}
                }
            );

            api.User = $resource(
                rootUrl + '/users/:userId',
                {'userId': '@_id'},
                {
                    update: {method: 'PUT'},
                    me: {method: 'GET', params: {'userId': 'me'}}
                }
            );

            api.Role = $resource(
                rootUrl + '/roles/:roleId',
                {'roleId': '@_id'},
                {
                    update: {method: 'PUT'}
                }
            );

            api.RecordPermission = $resource(
                rootUrl + '/roles/:roleId/permissions/records',
                {"roleId": '@roleId'}
            );

            return api;
        }
    ]);

}(window));