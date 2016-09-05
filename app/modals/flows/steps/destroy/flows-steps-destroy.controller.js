'use strict';

angular
  .module('FlowsStepsDestroyModalControllerModule', [])

  .controller('FlowsStepsDestroyModalController', function($scope, $modalInstance, Restangular, step, flow) {
    $scope.step = step;

    // delete user from server
    $scope.confirm = function() {
      var deletePromise = Restangular.one('flows', flow.id).one('steps', step.id).remove();

      deletePromise.then(function() {
        $modalInstance.close();

        // remove user from list
        flow.my_steps.splice(flow.my_steps.indexOf($scope.step), 1);
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
