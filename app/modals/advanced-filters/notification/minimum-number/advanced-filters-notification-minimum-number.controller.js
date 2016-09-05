'use strict';

angular
  .module('AdvancedFiltersNotificationMinimumNumberModalControllerModule', [
    'FormInputValidatorIntegerComponentModule'
  ])
  .controller('AdvancedFiltersNotificationMinimumNumberModalController', function(Restangular, $scope, $modalInstance, activeAdvancedFilters) {
    $scope.input = {
      value: null
    };

    $scope.save = function() {

      var filter = {
        title: 'Quantidade mínima de',
        desc: $scope.input.value + (+($scope.input.value) > 1 ? ' notificações' : ' notificação'),
        type: 'minimumNotificationNumber',
        value: $scope.input.value
      };

      activeAdvancedFilters.push(filter);
      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
