'use strict';

angular.module('FormInputValidatorIntegerComponentModule', [])
  .directive('formInputValidatorInteger', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ctrl) {
        if(!ctrl) {
          $log.warn('Integer validation requires ngModel to be on the element');
          return;
        }

        ctrl.$parsers.unshift(function parser(viewValue){
          if (/[0-9]/.test(viewValue)) {
            ctrl.$setValidity('integerValidator', true);
          } else {
            ctrl.$setValidity('integerValidator', false);
          }
          return viewValue;
        });
      }
    };
  });
