'use strict';

angular
  .module('ReportsEditDescriptionModalControllerModule', [])
  .controller('ReportsEditDescriptionModalController', function(Restangular, $scope, $modalInstance, report, refreshHistory) {
    $scope.report = angular.copy(report);

    $scope.save = function() {
      $scope.processingForm = true;

      var postUserPromise = Restangular.one('reports', report.category.id).one('items', report.id).customPUT({ description: $scope.report.description });

      postUserPromise.then(function(response) {
        refreshHistory();
        $modalInstance.close();

        $scope.processingForm = false;

        report.description = $scope.report.description;
      }, function(response) {
        $scope.processingForm = false;
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
