(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('SearchCtrl', ['$scope', '$api', function($scope, $api) {
			$api.Record.query(function(records) {
				$scope.records = records;
			});
		}]);

}(window))