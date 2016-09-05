'use strict';

angular
.module('ReportsEditReferenceModalControllerModule', [])

.controller('ReportsEditReferenceModalController', function(Restangular, $scope, $modalInstance, report, parentScope) {
  $scope.report = angular.copy(report);

  $scope.save = function() {
    $scope.processingForm = true;

    var postUserPromise = Restangular.one('reports', report.category.id).one('items', report.id).customPUT({
      reference: $scope.report.reference,
      return_fields: 'reference'
    });

    postUserPromise.then(function(response) {
      $modalInstance.close();

      $scope.processingForm = false;

      $scope.showMessage('ok', 'A referência do relato foi alterada com sucesso.', 'success', true);

      report.reference = $scope.report.reference;

      parentScope.refreshHistory();

    }, function(response) {
      $modalInstance.close();

      $scope.showMessage('exclamation-sign', 'Não foi possível alterar a referência.', 'error', true);

      $scope.processingForm = false;
    });
  };

  $scope.close = function() {
    $modalInstance.close();
  };
});