'use strict';

angular
  .module('CasesFinishModalModule', [
    'CasesServiceModule'
  ])
  .controller('CasesFinishModalController', function ($scope, $modalInstance, CasesService, kase) {
    console.log(kase);
    $scope.resolutionStates = kase.flow.my_resolution_states;
    $scope.resolutionState = {};

    $scope.valid = function () {
      return !_.isEmpty($scope.resolutionState);
    };

    $scope.confirm = function () {
      return (
        CasesService
          .finish(kase, $scope.resolutionState.selected)
          .then(function () {
            $scope.showMessage('ok', 'O caso foi finalizado com sucesso!', 'success', true);
            $modalInstance.close();
          })
      );
    };

    $scope.close = function() {
      $modalInstance.dismiss();
    };
  })
  .factory('CasesFinishModalService', function ($modal) {
    return {
      open: function (kase) {
        return (
          $modal.open({
            templateUrl: 'modals/cases/finish/cases-finish.template.html',
            windowClass: 'casesFinishModal',
            resolve: {
              kase: function () {
                return kase;
              }
            },
            controller: 'CasesFinishModalController',
            controllerAs: 'casesFinishModalCtrl'
          }).result
        );
      }
    };
  });
