(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('HomeCtrl', [
			'$scope', '$api',
      '$location', '$timeout',
			function($scope, $api, $location, $timeout) {

        var search = $location.search();
				$scope.records = $api.Record.query(search);

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