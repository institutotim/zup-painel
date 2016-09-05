'use strict';

angular
  .module('DetectScrollTopComponentModule', [])

  .directive('detectScrollTop', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        scope.$watch('scrollTop', function() {
          if (scope.scrollTop === true)
          {
            element.animate({scrollTop: 0}, 900);
            scope.scrollTop = false;
          }
        });
      }
    };
  });
