'use strict';

angular
  .module('ReportsEditCustomFieldModalControllerModule', [])
  .controller('ReportsEditCustomFieldModalController', function (Restangular, $scope, $modalInstance, field, report) {
    $scope.field = angular.copy(field);

    $scope.save = function () {
      $scope.processingForm = true;

      var data = {};
      data[$scope.field.id] = $scope.field.value;

      var updateCustomFieldsPromise = Restangular.one('reports', report.category.id).one('items', report.id).customPUT({
        custom_fields: data
      });

      updateCustomFieldsPromise.then(function () {
        $modalInstance.close();
        _.extend(field, $scope.field);
        $scope.processingForm = false;
      }, function () {
        $scope.processingForm = false;
      });
    };

    $scope.close = function () {
      $modalInstance.close();
    };
  });
