'use strict';

angular
  .module('AdvancedFiltersNotificationSinceLastModalControllerModule', [
    'FormInputSliderRangeComponentModule'
  ])
  .controller('AdvancedFiltersNotificationSinceLastModalController', function(Restangular, $scope, $modalInstance, activeAdvancedFilters) {
    $scope.input = {
      values: {
        begin: null,
        end: null
      }
    };

    $scope.save = function() {
      var values = $scope.input.values;
      var begin = values.begin;
      var end = values.end;
      begin = begin ? begin : 0;
      end = end ? end : 90;
      values.begin = begin;
      values.end = end;
      var filter = {
        title: 'Última notificação emitida há',
        desc: begin + ' a ' + end + ' dias',
        type: 'daysSinceLastNotification',
        value: $scope.input.values
      };

      activeAdvancedFilters.push(filter);
      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
