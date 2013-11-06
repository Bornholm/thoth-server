(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('NotificationsCtrl', [
			'$scope', '$notifications', '$timeout',
			function($scope, $notifs, $to) {

			function shift() {
				var n;
				var i = 0;
				while(i < $scope.notifications.length) {
					n = $scope.notifications[i];
					if(n && !n.persistent) {
						$scope.notifications.splice(i, 1);
						return;
					}
					++i;
				}
			}

			$scope.$watch('notifications', function(newVal, oldVal) {
				if(newVal.length) {
					$to(shift, 5000);
				}
			}, true);

			$scope.notifications = $notifs.getNotifications();

		}]);

}(window))