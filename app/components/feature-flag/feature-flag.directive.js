'use strict';

angular
  .module('FeatureFlagComponentModule', [])
  .directive('featureFlag', function (Restangular) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        scope.$watch('flag.enabled', function(newValue, oldValue) {
          if (newValue !== oldValue)
          {
            scope.loading = true;

            var saveFlagPromise = Restangular.one('feature_flags', scope.flag.id).customPUT({ status: scope.flag.enabled === true ? 1 : 0 });

            saveFlagPromise.then(function() {
              scope.loading = false;
            });
          }
        });
      }
    }
  });
