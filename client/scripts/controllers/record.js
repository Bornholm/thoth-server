(function(w) {

	"use strict";
	var angular = w.angular;

	var deps = [
		'$scope', 'lightRest',
		'$routeParams', '$location',
		'$notifications', '$translate'
	];

	function RecordCtrl(
		$scope, $rest,
		$routeParams, $location,
		$notifs, $translate
	) {

		var action = $scope.action = $routeParams.action;
		var recordId = $routeParams.recordId;

		switch(action) {
			case 'new':
				$scope.record = {};
				startWatchingChange();
				break;
			case 'edit':
			case 'view':
				if(recordId) {
					$rest.get('/api/records/:recordId', {recordId: recordId})
						.then(function(record) {
							$scope.record = record;
						}, $scope.serverErrorHandler)
						.then(startWatchingChange);
				} else {
					$location.path('/record/new');
				}
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

		function saveHandler(record) {
			$notifs.add($translate('GLOBAL.SAVED'), '', $notifs.SUCCESS);
			$scope.record = record;
			$scope.saveRequired = false;
			startWatchingChange();
		}

		function deleteHandler() {
			$notifs.add($translate('GLOBAL.DELETED'), '', $notifs.SUCCESS);
			$location.path('/home');
		}

		$scope.save = function() {
			var isNew = !('_id' in $scope.record);
			if(typeof unwatch === 'function') {
				unwatch();
			}
			if(isNew) {
				$rest.post('/api/records', $scope.record)
					.then(saveHandler, $scope.serverErrorHandler);
			} else {
				$rest.put('/api/records/:_id', $scope.record)
					.then(saveHandler, $scope.serverErrorHandler);
			}
		};

		$scope.delete = function() {
			var validateDelete = w.confirm($translate('RECORD_PAGE.DELETE_CONFIRM'));
			if(validateDelete) {
				$rest.delete('/api/records/:_id', $scope.record)
					.then(deleteHandler, $scope.serverErrorHandler);
			}
		};

		$rest.get('/api/tags').then(function(tags) {
			$scope.tagsAvailable = tags;
		}, $scope.serverErrorHandler);

	}

	RecordCtrl.$inject = deps;

	angular.module('Thoth')
		.controller('RecordCtrl', RecordCtrl);

}(window))