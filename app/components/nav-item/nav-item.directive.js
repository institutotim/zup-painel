'use strict';

angular
  .module('NavItemComponentModule', [])
  .directive('navItem', function ($location) {
    return {
      restrict: 'A',

      link: function(scope, element) {
        var toPath = element.find('a')[0].getAttribute('ng-href');

        scope.location = $location;
        scope.$watch('location.absUrl()', function(currentPath) {
          if (currentPath.indexOf(toPath) !== -1)
          {
            element.addClass('active');
          }
          else
          {
            element.removeClass('active');
          }
        });
      }
    };
  });
