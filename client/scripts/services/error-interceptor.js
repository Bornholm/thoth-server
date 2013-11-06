(function(w) {

    "use strict";
    var angular = w.angular;

    var deps = [
      '$rootScope',
      '$q'
    ];

    function ErrorInterceptor($rootScope, $q) {
      return {
        responseError: function(res) {

          var errorName;
          var data = res.data;

          if(data && data.name || data.error) {
            errorName = data.error || data.name;
          } else {
            errorName = 'UnknownError';
          }

          $rootScope.$broadcast('server-error', errorName, res);

          return $q.reject(res);
        }
      };
    }

    ErrorInterceptor.$inject = deps;

    angular.module('Thoth')
      .factory('errorInterceptor', ErrorInterceptor);

}(window));