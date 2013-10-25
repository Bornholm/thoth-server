(function(w) {

    "use strict";
    var angular = w.angular;

    angular.module('lightRest', ['ng'])
        .factory('lightRest', ['$http', '$q',
            function($http, $q) {

              var rest = {};

              var paramRe = /:([^\s\/]+)/g;
              function transformUrl(url, data, overwrite) {
                overwrite = overwrite || {};
                data = data || {};
                var result, key, value;
                while(result = paramRe.exec(url)) {
                  key = result[1];
                  value = key in overwrite ? overwrite[key] : data[key];
                  if(!angular.isUndefined(value)) {
                    url = url.replace(new RegExp(result[0], 'g'), value);
                  }
                }
                return url;
              }

              function pluckData(res) {
                return res.data;
              }

              function request(method, url, data, opts) {
                opts = opts || {};
                var req = {
                  method: method,
                  url: transformUrl(url, data, opts.overwrite || {}),
                  data: data
                };
                angular.extend(req, opts);
                return $http(req).then(pluckData);
              }

              var methods = 'post get put delete head'.split(' ');

              methods.forEach(function(m) {
                rest[m] = request.bind(null, m);
              });

              return rest;
              
            }
          ]
        );

}(window));