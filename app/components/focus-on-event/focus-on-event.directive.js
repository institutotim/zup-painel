'use strict';

angular.module('FocusOnEventComponentModule', [])
  .directive('focusOnEvent', function () {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$on(attrs.focusOnEvent, function() {
          element.focus();
        })
      }
    };
  });
