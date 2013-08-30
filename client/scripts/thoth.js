(function(w) {

	"use strict";

	var angular = w.angular;

	var Thoth = angular.module(
		'Thoth',
		['ngResource', 'ngCookies', 'pascalprecht.translate']
	);

	Thoth.config([
		'$routeProvider', '$locationProvider', '$httpProvider',
		'$translateProvider',
		function(
			$routeProvider, $locationProvider, $httpProvider,
			$translateProvider
		) {
			
			$routeProvider.when('/login', {
				templateUrl: 'templates/login.html'
			});

			$routeProvider.when('/home', {
				templateUrl: 'templates/home.html'
			});

			$routeProvider.when('/profile/:id', {
				templateUrl: 'templates/profile.html',
				controller: 'ProfileCtrl'
			});

			$routeProvider.when('/record/:recordId/:action', {
				templateUrl: 'templates/record.html',
				controller: 'RecordCtrl'
			});

			$routeProvider.when('/record/:action', {
				templateUrl: 'templates/record.html',
				controller: 'RecordCtrl'
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
						$location.url('/login');
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

			$translateProvider.useStaticFilesLoader({
				prefix: 'i10n/locale-',
				suffix: '.json'
			});

			$translateProvider.preferredLanguage('en');
			$translateProvider.useLocalStorage();

	}]);

	Thoth.run([
		'$rootScope', '$auth', '$location', 
		function($rootScope, $auth, $location) {

			$rootScope.$location = $location;
			$rootScope.$watch('$location.path()', $auth.ping.bind($auth));

			if($location.path() !== '/login') {
				$rootScope.nextUrl = $location.url();
			}

		}
	]);

}(window))