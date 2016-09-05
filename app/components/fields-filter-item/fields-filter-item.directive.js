'use strict';

angular
  .module('FieldsFilterItemComponentModule', [])
  .directive('fieldsFilterItem', function () {
    return {
      restrict: 'A',
      link: function postLink(scope) {
        scope.changeCondition = function(condition) {
          scope.item.condition = condition;
        };

        scope.$watch('item.fieldId', function() {
          if (scope.item.fieldId !== null)
          {
            scope.item.category.fields = _.flatten(_.pluck(scope.item.category.sections, 'fields'));
            for (var i = scope.item.category.fields.length - 1; i >= 0; i--) {
              if (scope.item.category.fields[i].id == scope.item.fieldId)
              {
                scope.item.field = scope.item.category.fields[i];
              }
            }
          }
        });

        scope.changeField = function(field) {
          scope.item.field = field;
        };

        scope.delete = function() {
          scope.$parent.items.splice(scope.$parent.items.indexOf(scope.item), 1);
        };
      }
    };
  });
