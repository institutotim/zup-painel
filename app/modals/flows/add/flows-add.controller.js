'use strict';

angular
  .module('FlowsAddModalControllerModule', [
      'FlowsServiceModule'
    ])

  .controller('FlowsAddModalController', function($rootScope, $scope, $modalInstance, FlowsService, flows, Error) {
    $scope.flow = {};

    $scope.save = function() {
      $scope.savePromise = FlowsService.create($scope.flow);

      $scope.savePromise.then(function(flow) {
        flows.push(flow);

        $modalInstance.close();

        $scope.showMessage('ok', 'O fluxo foi criado com sucesso', 'success', true);
      }, function(response) {

        if (typeof response.data.error !== 'object') {
          Error.show(response);
        } else {
          $scope.inputErrors = response.data.error;
        }
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
