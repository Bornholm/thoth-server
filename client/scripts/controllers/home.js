(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('HomeCtrl', [
			'$scope', 'lightRest',
      '$location', '$timeout',
			function($scope, $rest, $location, $timeout) {

        var search = $location.search();
				$rest.get('/api/records', null, {params: search})
          .then(function(records) {
            $scope.records = records;
          }, $scope.serverErrorHandler);

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

        $scope.viewRecord = function(recordId) {
          $location.path('/record/' + recordId + '/view');
        };

		  }
    ]);

}(window))