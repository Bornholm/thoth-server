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

            return api;
        }
    ]);

}(window));