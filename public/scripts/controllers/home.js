(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('HomeCtrl', ['$scope', 'Restangular', function($scope, R) {

			$scope.bookmarks = [];

			//Placeholder
			for(var i=50; i >= 0; i--) {
				$scope.bookmarks.push({
					label: 'Bookmark #' + i,
					id: i,
					desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit.'
				});
			}

		}]);

}(window))