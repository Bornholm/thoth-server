(function(w) {

    "use strict";
    var angular = w.angular;

    angular.module('Thoth')
        .factory('$rest', ['$http', function($http) {
            
            var Rest = function(opts) {
                opts = opts || {};
                this.baseUrl = opts.baseUrl || '/';
                this.resourceType = opts.resourceType || '';
            };

            var p = Rest.prototype;

            p.namespace = function(resourceType) {
                return new Rest({resourceType: resourceType});
            };

            function prepareArgs(method, resourceType, resource, opts) {
                if(arguments.length === 3) {
                    resourceType = null;
                    resource = arguments[1];
                    opts = arguments[2];
                }
                resourceType = resourceType || this.resourceType;
                return methods[method](resourceType, resource, opts);
            }

            var methods = {
                list: function(resourceType, resource, opts) {
                     var url = this.baseUrl + '/' + resourceType;
                     return $http.get(url, null, opts);
                },
                get: function(resourceType, resource, opts) {
                     var url = this.baseUrl + '/' + resourceType + '/' + (resource._id || opts.resourceId);
                     return $http.get(url, null, opts);
                },
                get: function(resourceType, resource, opts) {
                     var url = this.baseUrl + '/' + resourceType + '/' + (resource._id || opts.resourceId);
                     return $http.get(url, null, opts);
                },

            }

            'get post put delete patch list'
                .split(' ')
                .forEach(function(method) {
                    p[method] = prepareArgs.bind(p, method);
                });

            return new Rest();

        }
    ]);

}(window));