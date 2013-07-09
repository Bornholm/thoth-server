(function(w) {

	"use strict";

	var angular = w.angular;

	var Thoth = angular.module('Thoth', ['restangular', 'ngCookies']);

	Thoth.config([
		'$routeProvider', '$locationProvider', '$httpProvider', 
		'RestangularProvider',
		function(
			$routeProvider, $locationProvider, $httpProvider, 
			RestangularProvider) {

		RestangularProvider.setBaseUrl('/api');

		$routeProvider.when('/search', {
			templateUrl: 'templates/search.html'
		});

		$routeProvider.when('/login', {
			templateUrl: 'templates/login.html'
		});

		$routeProvider.when('/home', {
			templateUrl: 'templates/home.html'
		});

		$routeProvider.when('/record/:recordId/:action', {
			templateUrl: 'templates/record.html',
			controller: 'RecordCtrl'
		});

		$routeProvider.when('/record/:action', {
			templateUrl: 'templates/record.html',
			controller: 'RecordCtrl'
		});

		$routeProvider.otherwise({redirectTo: '/login'});

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