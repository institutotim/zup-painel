'use strict';

angular
  .module('ReportStatusComponentModule', [])

  .directive('reportStatus', function () {
    return {
      restrict: 'A',
      link: function postLink(scope) {
        if (scope.$parent.$parent.updating === true)
        {
          scope.$watch('status', function(oldValue, newValue) {
            if (oldValue !== newValue)
            {
              scope.$parent.$parent.updateStatuses[newValue.id] = scope.status;
            }
          }, true);
        }
      }
    };
  });
