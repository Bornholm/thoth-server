(function(w) {

	"use strict";
	var angular = w.angular;

	angular.module('Thoth')
		.controller('RecordCtrl', [
			'$scope', '$api', '$routeParams',
			'$location', '$notifications',
			function(
				$scope, $api, $routeParams,
				$location, $notifs
			) {

			var action = $scope.action = $routeParams.action;
			var recordId = $routeParams.recordId;

			switch(action) {
				case 'new':
					$scope.record = new $api.Record();
					startWatchingChange();
					break;
				case 'edit':
				case 'view':
					if(recordId) {
						$scope.record = $api.Record.get({recordId: recordId}, function(r) {
							$scope.record = r;
							startWatchingChange();
						});
					} else $location.path('/record/new');
					break;
				default:
					$location.path('/record/new');
			}

			var unwatch;
			function detectModification(newVal, oldVal) {
				if(oldVal !== newVal) {
					$scope.saveRequired = true;
				}
			};
			
			function startWatchingChange() {
				unwatch = $scope.$watch(
					'record.label + record.tags + record.text',
					detectModification
				);
			}

			function saveHandler() {
				$notifs.add('Sauvegardé !', '', $notifs.SUCCESS);
				$scope.saveRequired = false;
				startWatchingChange();
			}

			$scope.save = function() {
				var isNew = !('_id' in $scope.record);
				if(typeof unwatch === 'function') {
					unwatch();
				}
				if(isNew) {
					$scope.record.$save(saveHandler);
				} else {
					$scope.record.$update(saveHandler);
				}
			}

			$scope.availableTags = [
				'Webpublic',
				'Machine',
				'Root'
			];

		}]);

}(window))