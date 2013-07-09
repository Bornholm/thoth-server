(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('NotificationsCtrl', [
			'$scope', '$notifications', '$timeout',
			function($scope, $notifs, $to) {
			$scope.notifications = $notifs.getNotifications();
			var shift = $scope.notifications.shift.bind($scope.notifications);
			$scope.$watch('notifications', function(newVal, oldVal) {
				if(newVal.length > oldVal.length) {
					$to(shift, 5000);
				}
			}, true);
		}]);

}(window))