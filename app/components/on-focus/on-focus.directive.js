'use strict';

angular
  .module('OnFocusComponentModule', [])
  .directive('onFocus', function () {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {
        elm.bind('focus', function() {
          scope.$apply(attrs.onFocus);
        });
      }
    };
  });
