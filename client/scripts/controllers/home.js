(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('HomeCtrl', [
			'$scope', '$api',
			function($scope, $api) {
				$scope.records = $api.Record.query();
		}]);

}(window))