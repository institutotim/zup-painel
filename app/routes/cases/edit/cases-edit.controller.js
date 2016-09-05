'use strict';

angular
  .module('CasesEditControllerModule', ['CaseDirectiveModule'])

  .controller('CasesEditController', function ($scope, Restangular, $modal, $stateParams) {
    $scope.id = $stateParams.id;

    $scope.loading = true;
    $scope.currentTab = 'steps';
    $scope.stepId = null;

    $scope.selectConductor = function () {
      $modal.open({
        templateUrl: 'views/cases/selectConductor.html',
        windowClass: 'modalConductor'
      });
    };

    $scope.changeConductor = function () {
      $modal.open({
        templateUrl: 'views/cases/changeConductor.html',
        windowClass: 'modalConductor'
      });
    };
  });
