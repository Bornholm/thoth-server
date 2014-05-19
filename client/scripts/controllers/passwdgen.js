(function(w, RandExp) {

  "use strict";
  var angular = w.angular;

  function PasswdGenCtrl($scope) {

    $scope.count = 10;
    $scope.pattern = '[A-Za-z0-9]{14}';
    $scope.passwords = [];

    $scope.generate = function() {
      var rExp = new RandExp($scope.pattern);
      return rExp.gen();
    };

    $scope.generateList = function(count) {
      var list = [];
      while(count--) {
        list.push($scope.generate());
      }
      return list;
    };

    $scope.updateList = function() {
      $scope.passwords = $scope.generateList(10);
    };

    $scope.updateList();

  }

  PasswdGenCtrl.$inject = ['$scope'];

  angular.module('Thoth')
    .controller('PasswdGenCtrl', PasswdGenCtrl);

}(window, RandExp))