'use strict';

angular
  .module('InventoryCreateValueComponentModule', [])

  .directive('InventoryCreateValue', function () {
    return {
      restrict: 'A',
      link: function postLink(scope) {
        var count = 1;

        scope.newValue = function() {
          scope.field.available_values.push('Nova opção ' + count); // jshint ignore:line

          count++;
        };
      }
    };
  });
