(function (angular, $) {
  'use strict';

  angular
    .module('InventoryPopoverLinkComponentModule', [])
    .directive('inventoryPopoverLink', inventoryPopoverLink);

  inventoryPopoverLink.$inject = [
    '$document'
  ];
  function inventoryPopoverLink() {
    return {
      restrict: 'A',
      link: function postLink($scope) {
        $scope.openPopover = function (attr) {
          $scope.$emit('hidePopovers', true);

          $scope.popover[attr] = true;
        };

        $scope.closePopover = function () {
          $scope.$emit('hidePopovers', true);
        }
      }
    };
  }

})(angular, $);
