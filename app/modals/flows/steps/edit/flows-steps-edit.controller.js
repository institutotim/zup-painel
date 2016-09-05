'use strict';

angular
  .module('FlowsStepsEditModalControllerModule', [])

  .controller('FlowsStepsEditModalController', function ($scope, $modalInstance, Restangular, step, flow) {
    $scope.step = angular.copy(step);

    $scope.update = function () {
      $scope.updateStepPromise = Restangular.one('flows', flow.id).one('steps', step.id).customPUT({title: $scope.step.title});

      $scope.updateStepPromise.then(function () {
        step.title = $scope.step.title;

        $modalInstance.close();
      });
    };

    $scope.close = function () {
      $modalInstance.close();
    };
  });
