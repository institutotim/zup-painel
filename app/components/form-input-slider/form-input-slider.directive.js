'use strict';

angular.module('FormInputSliderComponentModule', [])
  .directive('formInputSlider', function () {
    return {
      restrict: 'CA',
      require: '?ngModel',
      link: function (scope, element, attrs, ctrl) {
        if (!ctrl) {
          $log.warn('Slider directive requires ngModel to be on the element');
          return;
        }

        var el = element[0];

        /**
         * Add the input-slider class
         */
        angular.element(el).addClass('input-slider');

        /**
         * Create the single slider
         */
        noUiSlider.create(el, {
          start: 0,
          step: 1,
          connect: 'lower',
          range: {
            min: [0],
            max: [90]
          }
        });

        ctrl.$render = function() {
          if (ctrl.$viewValue > 90) {
            el.noUiSlider.set(90);
          } else if (ctrl.$viewValue < 0) {
            el.noUiSlider.set(0);
          } else {
            el.noUiSlider.set(ctrl.$viewValue || 0);
          }
        };

        var value;
        el.noUiSlider.on('slide', function(values, handle, unencoded) {
          value = parseInt(values[0] || 0, 10);
          scope.$evalAsync(update);
        });
        update();

        function update() {
          ctrl.$setViewValue(value);
        }

        var $handlerDestroy = scope.$on('$destroy', function() {
          el.noUiSlider.off('slide');
          el.noUiSlider.destroy();

          $handlerDestroy();
          $handlerDestroy = null;
        });
      }
    };
  });
