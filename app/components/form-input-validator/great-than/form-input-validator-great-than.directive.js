'use strict';

angular.module('FormInputValidatorGreatThanComponentModule', [])
  .directive('formInputValidatorGreatThan', function ($parse) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        if (!ctrl) {
          $log.warn('"Great than" validation requires ngModel to be on the element');
          return;
        }

        var minimumValue = $parse(attrs.formInputValidatorGreatThan)(scope);
        ctrl.$parsers.unshift(function parser(viewValue) {
          if (viewValue >= minimumValue) {
            ctrl.$setValidity('greatThanValidator', true);
          } else {
            ctrl.$setValidity('greatThanValidator', false);
          }
          return viewValue;
        });
      }
    };
  });
