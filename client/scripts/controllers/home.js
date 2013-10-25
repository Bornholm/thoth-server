(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('HomeCtrl', [
			'$scope', 'lightRest',
      '$location', '$timeout',
			function($scope, $rest, $location, $timeout) {

        var search = $location.search();
				$scope.records = $rest.get('/api/records', null, {params: search});

        $scope.passphrase = "";
        $scope.showPassphraseInput = false;

        $scope.askPassphrase = function() {
          $scope.passphrase = "";
          $scope.showPassphraseInput = true;
        };

        $scope.resetPassphrase = function() {
          $timeout(function() {
            $scope.passphrase = "";
            $scope.showPassphraseInput = false;
          }, 0);
        };

		  }
    ]);

}(window))