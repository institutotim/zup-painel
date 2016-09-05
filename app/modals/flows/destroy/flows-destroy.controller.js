'use strict';

angular
  .module('FlowsDestroyModalControllerModule', [
      'FlowsServiceModule'
    ])

  .controller('FlowsDestroyModalController', function($scope, $modalInstance, FlowsService, flow, flows) {
    $scope.flow = flow;

    // delete user from server
    $scope.confirm = function() {
      var deletePromise = FlowsService.destroy(flow.id);

      deletePromise.then(function() {
        $modalInstance.close();

        // remove flow from list
        flows.splice(flows.indexOf(flow), 1);
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
