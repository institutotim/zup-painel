'use strict';

angular
  .module('AdvancedFiltersNotificationOverdueModalControllerModule', [
    'FormInputSliderRangeComponentModule'
  ])
  .controller('AdvancedFiltersNotificationOverdueModalController', function(Restangular, $scope, $modalInstance, activeAdvancedFilters) {
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
        title: 'Notificações vencidas',
        desc: begin + ' a ' + end + ' dias',
        type: 'daysForOverdueNotification',
        value: $scope.input.values
      };

      activeAdvancedFilters.push(filter);
      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
