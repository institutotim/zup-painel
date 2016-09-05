'use strict';

angular
  .module('AdvancedFiltersQueryModalControllerModule', [])
  .controller('AdvancedFiltersQueryModalController', function($scope, $modalInstance, activeAdvancedFilters) {
    $scope.input = {};

    $scope.save = function() {
      var filter = {
        title: 'Protocolo ou endereço',
        desc: $scope.input.query,
        type: 'query',
        value: $scope.input.query
      };

      activeAdvancedFilters.push(filter);

      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
