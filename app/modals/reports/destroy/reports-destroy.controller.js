'use strict';

angular
  .module('ReportsDestroyModalControllerModule', ['ReportsItemsServiceModule'])
  .controller('ReportsDestroyModalController', function($rootScope, $scope, Restangular, ReportsItemsService, $modalInstance, report, $log) {

    $log.info('ReportsDestroyModalController created.');

    $scope.$on("$destroy", function() {
      $log.info('ReportsDestroyModalController destroyed.');
    });

    $scope.report = report;

    // delete user from server
    $scope.confirm = function() {
      var deletePromise = ReportsItemsService.remove($scope.report.id);
      $scope.deleting = true;

      deletePromise.then(function() {
        $modalInstance.close();
        $rootScope.$broadcast('reports:itemRemoved', $scope.report.id);
        $scope.deleting = false;
        $scope.showMessage('ok', 'O Relato ' + $scope.report.protocol + ' foi removido com sucesso', 'success', true);
      }, function(){
        $scope.deleting = false;
        $scope.showMessage('exclamation-sign', ' Não foi possível remover o relato ' + $scope.report.protocol + '. Por favor, tente novamente em alguns minutos.', 'error', true);
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
