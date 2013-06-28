(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('NewRecordCtrl', ['$scope', 'Restangular', function($scope, R) {

			$scope.save = function() {
				$scope.record =  R.all('records').post($scope.record);
			}

			$scope.availableTags = [
				'Webpublic',
				'Machine',
				'Root'
			];

			$scope.record = {
				label: "Webpublic",
				tags: ['Web', 'Machine'],
				text: "Lorem Ipsum dolor sit amet..."
			};

		}]);

}(window))