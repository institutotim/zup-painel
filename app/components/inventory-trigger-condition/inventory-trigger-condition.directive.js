'use strict';

angular
  .module('InventoryTriggerConditionComponentModule', [])

  .directive('inventoryTriggerCondition', function (Restangular) {
    return {
      restrict: 'A',
      scope: {
        'category': '='
      },
      link: function postLink(scope) {
        scope.$parent.$watch('condition.inventory_field_id', function() {
          _.each(scope.category.sections, function(section) {
            var field = _.findWhere(section.fields, { id: parseInt(scope.$parent.condition.inventory_field_id, 10) });

            if (!_.isUndefined(field))
            {
              scope.$parent.condition.field = field;

              return;
            }
          });
        });
      }
    };
  });
