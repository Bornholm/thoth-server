(function(w) {

	"use strict";

	var angular = w.angular;

	var Thoth = angular.module('Thoth', []);

	Thoth.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

		$routeProvider.when('/search', {
			templateUrl: 'templates/search.html'
		});

		$routeProvider.when('/bookmarks', {
			templateUrl: 'templates/bookmarks.html'
		});

		$routeProvider.otherwise({redirectTo: '/bookmarks'});

		$routeProvider.html5Mode = false;

	}]);

	Thoth.controller('NavCtrl', ['$scope', '$location', function($scope, $location) {

		$scope.navState = {
			bookmarks: false,
			'new-entry': false,
			search: false,
			admin: false,
			profile: false
		}

		$scope.$location = $location

		$scope.$watch('$location.path()', function() {
			var path = $location.path();
			Object.keys($scope.navState).forEach(function(key) {
				$scope.navState[key] = (path === '/'+key);
			});
		});

	}]);

}(window))