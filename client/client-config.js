(function(w) {
  'use strict';
  var angular = w.angular;
  angular.module('Thoth')
    .constant('config', {

      apiBaseURL: '/api', // Root API URL

      languages: {
        available: [
          'en',
          'fr'
        ],
        preferred: 'fr'
      },

      recordsPerPage: 15

    });
}(window));
