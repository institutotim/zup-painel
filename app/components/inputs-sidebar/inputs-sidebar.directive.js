'use strict';

angular
  .module('InputsSidebarComponentModule', [])

  .directive('inputsSidebar', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        element.affix({
          offset: {
            top: 75
          }
        });
      }
    };
  });
