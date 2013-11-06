(function(w) {

	"use strict";
	var angular = w.angular;

	var deps = [
		'$scope', 'lightRest',
		'$routeParams', '$location',
		'$notifications', '$translate',
		'$timeout'
	];

	function RecordCtrl(
		$scope, $rest,
		$routeParams, $location,
		$notifs, $translate,
		$timeout
	) {

		var action = $scope.action = $routeParams.action;
		var recordId = $routeParams.recordId;

		$scope.watchingExp = 'record.label + record.tags + record.text';

		switch(action) {
			case 'new':
				$scope.record = {};
				$timeout(function() {
					$scope.$broadcast('start-watching');
				}, 1000);
				break;
			case 'edit':
			case 'view':
				if(recordId) {
					$rest.get('/api/records/:recordId', {recordId: recordId})
						.then(function(record) {
							$scope.record = record;
							$scope.$broadcast('start-watching');
						}, $scope.serverErrorHandler);
				} else {
					$location.path('/record/new');
				}
				break;
			default:
				$location.path('/record/new');
		}
		
		function saveHandler(record) {
			$notifs.add($translate('GLOBAL.SAVED'), '', $notifs.SUCCESS);
			$scope.record = record;
			$scope.$broadcast('reset-watching');
		}

		function deleteHandler() {
			$notifs.add($translate('GLOBAL.DELETED'), '', $notifs.SUCCESS);
			$location.path('/home');
		}

		$scope.save = function() {
			var isNew = !('_id' in $scope.record);
			$scope.$broadcast('stop-watching');
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

		$scope.canDelete = function() {
      return ('_id' in $scope.record);
    };

		$rest.get('/api/tags').then(function(tags) {
			$scope.tagsAvailable = tags;
		}, $scope.serverErrorHandler);

	}

	RecordCtrl.$inject = deps;

	angular.module('Thoth')
		.controller('RecordCtrl', RecordCtrl);

}(window))