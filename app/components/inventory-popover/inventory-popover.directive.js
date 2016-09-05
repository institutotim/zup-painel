(function (angular) {
  'use strict';

  angular
    .module('InventoryPopoverComponentModule', [])

    .directive('inventoryPopover', function () {
      return {
        restrict: 'A',
        link: function postLink(scope) {
          scope.popover = {permissions: false, options: false, remove: false};

          scope.$on('hideOpenPopovers', function () {
            for (var x in scope.popover) {
              if (scope.popover[x] === true) {
                scope.popover[x] = false;
              }
            }

            safeApply();
          });

          function safeApply() {
            if(!scope.$$phase) {
              scope.$apply();
            }
          }
        }
      };
    });

})(angular);
