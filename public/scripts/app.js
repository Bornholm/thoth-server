(function(w) {

	"use strict";

	var angular = w.angular;

	var Thoth = angular.module('Thoth', []);

	Thoth.config(['$routeProvider', '$locationProvider', '$httpProvider', 
		function($routeProvider, $locationProvider, $httpProvider) {

		$routeProvider.when('/search', {
			templateUrl: 'templates/search.html'
		});

		$routeProvider.when('/login', {
			templateUrl: 'templates/login.html'
		});

		$routeProvider.when('/home', {
			templateUrl: 'templates/home.html'
		});

		$routeProvider.when('/new-record', {
			templateUrl: 'templates/new-record.html'
		});

		$routeProvider.otherwise({redirectTo: '/home'});

		$routeProvider.html5Mode = false;

		// Auth interceptor

		var interceptor = ['$location', '$q', function($location, $q) {

			function success(response) {
				return response;
			}

			function error(response) {
				if(response.status === 401) {
					$location.path('/login');
					return $q.reject(response);
				}else {
					return $q.reject(response);
				}
			}
 
			return function(promise) {
				return promise.then(success, error);
			}

		}];

		$httpProvider.responseInterceptors.push(interceptor);

	}]);

	Thoth.run(['$rootScope', '$auth', '$location', function($rootScope, $auth, $location) {
		$rootScope.$location = $location;
		$rootScope.$watch('$location.path()', $auth.ping.bind($auth));
	}])

}(window))