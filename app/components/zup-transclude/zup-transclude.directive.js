'use strict';

angular
  .module('ZupTranscludeComponentModule', [])

  .directive('zupTransclude', function() {
    return {
      compile: function(e, a, transclude) {
        return function(scope, element) {
          transclude(scope.$new(), function(clone) {
            element.append(clone);
          });
        };
      }
    };
  })
