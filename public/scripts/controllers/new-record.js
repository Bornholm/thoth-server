(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('NewRecordCtrl', ['$scope', function($scope) {

			$scope.availableTags = [
				{label: 'Webpublic'},
				{label: 'Machine'},
				{label: 'Root'}
			];

			$scope.newRecord = {
				label: "Webpublic",
				tags: [{label: 'Web'}, {label: 'Machine'}],
				text: "Lorem Ipsum dolor sit amet..."
			};

		}]);

}(window))