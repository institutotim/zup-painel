'use strict';

angular
  .module('GenericInputComponentModule', [])

  .directive('genericInput', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {

        scope.$watch('inputErrors', function() {
          var errors = scope.inputErrors,
              group = $(element).closest('.form-group');

          // clear errors
          element.removeClass('has-error');
          group.removeClass('has-error');

          if (typeof errors !== 'undefined')
          {
            for (var index in errors)
            {
              if (index === element.attr('name'))
              {
                element.addClass('has-error');
                group.addClass('has-error');
              }
            }
          }
        });

        scope.$parent.$watch('processingForm', function() {
          if (scope.$parent.processingForm === true)
          {
            element.attr('disabled', true);
          }
          else
          {
            element.attr('disabled', false);
          }
        });

      }
    };
  });
