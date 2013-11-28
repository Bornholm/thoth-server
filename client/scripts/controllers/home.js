(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('HomeCtrl', [
			'$scope', 'lightRest',
      '$location', '$timeout', 'config',
			function($scope, $rest, $location, $timeout, config) {

        $scope.totalRecords = 0;
        var search = $scope.search = $location.search() || {};

        search.recordsPerPage = config.recordsPerPage || 5;
        search.prevDisabled = true;
        search.nextDisabled = true;
        search.skip = +search.skip || 0;
        search.limit = +search.limit || search.recordsPerPage;
        search.skip = search.skip < 0 ? 0 : +search.skip;
        search.limit = search.limit < 0 ? 0 : +search.limit;
        search.nextSkip = search.skip+search.limit;
        search.prevSkip = search.skip-search.limit < 0 ? 0 : search.skip-search.limit;

				$rest.get('/records', null, {
          params: {
            search: search.search,
            limit: search.limit,
            skip: search.skip
          }
          })
          .then(function(records) {
            $scope.records = records;
          });

        $rest.get('/records/stats', null,{
            params: {
              search: search.search
            }
          })
          .then(function(result) {
            $scope.totalRecords = result.total;
          });

        $scope.passphrase = "";
        $scope.showPassphraseInput = false;

        $scope.askPassphrase = function() {
          $scope.passphrase = "";
          $scope.showPassphraseInput = true;
        };

        $scope.resetPassphrase = function() {
          $timeout(function() {
            $scope.passphrase = "";
          }, 0);
        };

        $scope.min = function() {
          return Math.min.apply(Math, arguments);
        };

        $scope.viewRecord = function(recordId) {
          $location.path('/record/' + recordId + '/view');
        };

		  }
    ]);

}(window))