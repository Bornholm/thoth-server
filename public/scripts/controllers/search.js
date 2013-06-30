(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('SearchCtrl', ['$scope', 'Restangular', function($scope, R) {

			$scope.records = R.all('records').getList();

			

		}]);

}(window))