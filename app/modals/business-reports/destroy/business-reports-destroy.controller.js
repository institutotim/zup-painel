'use strict';

angular
  .module('BusinessReportsDestroyModalModule', ['BusinessReportsServiceModule', 'FocusIfComponentModule'])
  .controller('BusinessReportsDestroyModalController', function ($rootScope, $modal, $scope, Restangular, BusinessReportsService, $modalInstance, report, promise, $log) {

    $log.info('ReportsDestroyModalController created.');

    $scope.$on("$destroy", function () {
      $log.info('ReportsDestroyModalController destroyed.');
    });

    $scope.report = report;

    $scope.confirm = function () {
      var deletePromise = BusinessReportsService.remove($scope.report.id);
      $scope.deleting = true;

      deletePromise.then(function () {
        $modalInstance.close();
        $scope.deleting = false;
        $scope.showMessage('ok', 'O Relatório ' + $scope.report.title + ' foi removido com sucesso', 'success', true);
        promise.resolve(report);
      }, function () {
        $scope.deleting = false;
        $scope.showMessage('exclamation-sign', ' Não foi possível remover o relatório ' + $scope.report.title + '. Por favor, tente novamente em alguns minutos.', 'error', true);
        $modalInstance.close();
        promise.reject(report);
      });
    };

    $scope.close = function () {
      $modalInstance.close();
    };
  })
  .factory('BusinessReportDestroyModalService', function ($modal, $q) {
    return {
      open: function (report) {
        var deferred = $q.defer();

        $modal.open({
          templateUrl: 'modals/business-reports/destroy/business-reports-destroy.template.html',
          windowClass: 'businessReportDestroyModal',
          resolve: {
            report: function () {
              return report;
            },

            promise: function () {
              return deferred;
            }
          },
          controller: 'BusinessReportsDestroyModalController'
        });

        return deferred.promise;
      }
    }
  });
