(function(w) {

	"use strict";

	var angular = w.angular;

	var Thoth = angular.module(
		'Thoth',
		[
			'ngResource', 'ngCookies',
			'pascalprecht.translate', 'lightRest',
			'ngRoute', 'ngAnimate'
		]
	);

	Thoth.config([
		'$routeProvider', '$locationProvider', '$httpProvider',
		'$translateProvider',
		function(
			$routeProvider, $locationProvider, $httpProvider,
			$translateProvider
		) {

		$translateProvider.useStaticFilesLoader({
			prefix: 'i10n/locale-',
			suffix: '.json'
		});

		$translateProvider.preferredLanguage('en');
		$translateProvider.fallbackLanguage('en');
		$translateProvider.useLocalStorage();
			
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

			$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
			$httpProvider.interceptors.push('errorInterceptor');

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

			var last401Error = 0;
			$rootScope.$on('server-error', function(evt, errorName, res) {

				// Don't spam 401 errors
				if(res.status === 401) {
					var now = Date.now();
					if(now - last401Error > 2000) {
						last401Error = now;
					} else {
						return;
					}
				}

				$notifs.add(
					$translate('ERROR.' + errorName + '.TITLE'),
					$translate('ERROR.' + errorName + '.DESC'),
					$notifs.DANGER
				);

				if(errorName === 'UnknownError' || res.status === 401) {
					$location.url('/login');
				}

			});

			// Warning if not HTTPS
			if($window.location.protocol !== 'https:') {
				$notifs.add(
					$translate('UNENCRYPTED_CONNECTION.TITLE'),
					$translate('UNENCRYPTED_CONNECTION.DESC'),
					$notifs.DANGER,
					true
				);
			}

		}
	]);

}(window))