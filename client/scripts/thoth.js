(function(w) {

	"use strict";

	var angular = w.angular;

	var Thoth = angular.module(
		'Thoth',
		['ngResource', 'ngCookies', 'pascalprecht.translate', 'lightRest']
	);

	Thoth.config([
		'$routeProvider', '$locationProvider', '$httpProvider',
		'$translateProvider',
		function(
			$routeProvider, $locationProvider, $httpProvider,
			$translateProvider
		) {
			
			$routeProvider.when('/login', {
				templateUrl: 'templates/login.html',
				controller: 'LoginCtrl'
			});

			$routeProvider.when('/home', {
				templateUrl: 'templates/home.html',
				controller: 'HomeCtrl'
			});

			$routeProvider.when('/profile/:userId', {
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

			$routeProvider.when('/role/:roleId/:action', {
				templateUrl: 'templates/role.html',
				controller: 'RoleCtrl'
			});

			$routeProvider.when('/role/:action', {
				templateUrl: 'templates/role.html',
				controller: 'RoleCtrl'
			});

			$routeProvider.when('/admin', {
				templateUrl: 'templates/admin.html',
				controller: 'AdminCtrl'
			});

			$routeProvider.when('/tag/:tagId/:action', {
				templateUrl: 'templates/tag.html',
				controller: 'TagCtrl'
			});

			$routeProvider.when('/tag/:action', {
				templateUrl: 'templates/tag.html',
				controller: 'TagCtrl'
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
			$translateProvider.fallbackLanguage('en');
			$translateProvider.useLocalStorage();

	}]);

	Thoth.run([
		'$rootScope', '$auth',
		'$location', '$window',
		'$notifications', '$translate',
		function(
			$rootScope, $auth,
			$location, $window,
			$notifs, $translate) {

			$rootScope.$location = $location;
			$rootScope.$watch('$location.path()', function(newVal) {

				$auth.ping(); // Check server

				if(newVal === '/login') {
					$rootScope.isNavbarVisible = false;
				} else {
					$rootScope.isNavbarVisible = true;
				}
				
			});

			if($location.path() !== '/login') {
				$rootScope.nextUrl = $location.url();
			}

			// Warning if not HTTPS
			if($window.location.protocol !== 'https:') {
				$notifs.add(
					$translate('UNENCRYPTED_CONNECTION.TITLE'),
					$translate('UNENCRYPTED_CONNECTION.DESC'),
					$notifs.DANGER,
					true
				);
			}

			// REST API general error handling
			$rootScope.serverErrorHandler = function(res) {
				var data = res.data;
				if(data && data.name || data.error) {
					var errorName = data.error || data.name;
					$notifs.add(
						$translate('ERROR.' + errorName + '.TITLE'),
						$translate('ERROR.' + errorName + '.DESC'),
						$notifs.DANGER
					);
				} else {
					$notifs.add(
						$translate('ERROR.UnknownError.TITLE'),
						$translate('ERROR.UnknownError.DESC'),
						$notifs.DANGER
					);
				}
			};

		}
	]);

}(window))