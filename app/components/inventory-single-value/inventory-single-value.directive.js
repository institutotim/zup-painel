'use strict';

angular
  .module('InventorySingleValueComponentModule', [])

  .directive('inventorySingleValue', function (Restangular) {
    return {
      restrict: 'A',
      link: function postLink(scope) {
        scope.newValue = angular.copy(scope.option.value);

        scope.saveOption = function() {
          scope.editingValue = false;

          if (scope.isExistingField)
          {
            scope.updating = true;

            var updateOptionPromise = Restangular.all('inventory').one('fields', scope.field.id).one('options', scope.option.id).customPUT({ value: scope.newValue });

            updateOptionPromise.then(function() {
              scope.updating = false;
            });
          }

          scope.option.value = scope.newValue;
        };

        scope.removeOption = function() {
          var index = scope.$parent.field.field_options.indexOf(scope.option); // jshint ignore:line

          if (scope.isExistingField)
          {
            scope.updating = true;

            var updateOptionPromise = Restangular.all('inventory').one('fields', scope.field.id).one('options', scope.option.id).remove();

            updateOptionPromise.then(function() {
              scope.updating = false;
            });
          }

          if (index !== -1)
          {
            scope.option.disabled = true; // jshint ignore:line
          }
        };
      }
    };
  });
