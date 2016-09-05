'use strict';

angular
  .module('InventoryEditSectionComponentModule', [])

  .directive('inventoryEditSection', function () {
    return {
      restrict: 'A',
      link: function postLink(scope) {
        scope.$watch('section.permissions', function(newValue, oldValue) {
          if (newValue !== oldValue)
          {
            var removedEditValues = _.difference(oldValue.groups_can_edit, newValue.groups_can_edit);
            var addedEditValues = _.difference(newValue.groups_can_edit, oldValue.groups_can_edit);

            var removedViewValues = _.difference(oldValue.groups_can_view, newValue.groups_can_view);
            var addedViewValues = _.difference(newValue.groups_can_view, oldValue.groups_can_view);

            for (var j = scope.section.fields.length - 1; j >= 0; j--) {
              if (addedEditValues)
              {
                scope.section.fields[j].permissions.groups_can_edit = _.union(scope.section.fields[j].permissions.groups_can_edit, addedEditValues);
              }

              if (addedViewValues)
              {
                scope.section.fields[j].permissions.groups_can_view = _.union(scope.section.fields[j].permissions.groups_can_view, addedViewValues);
              }

              if (removedEditValues)
              {
                scope.section.fields[j].permissions.groups_can_edit = _.difference(scope.section.fields[j].permissions.groups_can_edit, removedEditValues);
              }

              if (removedViewValues)
              {
                scope.section.fields[j].permissions.groups_can_view = _.difference(scope.section.fields[j].permissions.groups_can_view, removedViewValues);
              }
            };
          }
        }, true);
      }
    };
  });
