'use strict';

angular
  .module('CasesInactiveModalModule', [
      'CasesServiceModule'
    ])

  .controller('CasesInactiveModalController', function(CasesService, $scope, $modalInstance, kase) {
    $scope.case = kase;

    $scope.confirm = function() {
      return (
        CasesService.inactive(kase)
          .then(function() {
            $modalInstance.close();
            $scope.showMessage('ok', 'O caso foi desativado com sucesso.', 'success', false);

            kase.status = 'inactive';
          })
      );
    };

    $scope.close = function() {
      $modalInstance.dismiss();
    };
  })
  .factory('CasesInactiveModalService', function ($modal) {
    return {
      open: function (kase) {
        return (
          $modal.open({
            templateUrl: 'modals/cases/inactive/cases-inactive.template.html',
            windowClass: 'casesInactiveModal',
            resolve: {
              kase: function () {
                return kase;
              }
            },
            controller: 'CasesInactiveModalController',
            controllerAs: 'casesInactiveModalCtrl'
          }).result
        );
      }
    };
  });
