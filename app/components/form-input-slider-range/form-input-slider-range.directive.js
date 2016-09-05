'use strict';

angular.module('FormInputSliderRangeComponentModule', [])
  .directive('formInputSliderRange', function ($parse) {
    return {
      restrict: 'CA',
      require: '?ngModel',
      link: function(scope, element, attrs, ctrl) {
        if (!ctrl) {
          $log.warn('Slider directive requires ngModel to be on the element');
          return;
        }

        var el = element[0];

        /**
         * Add the input-slider class
         */
        angular.element(el).addClass('input-slider-range');

        /**
         * Create the single slider
         */
        noUiSlider.create(el, {
          start: [0, 90],
          step: 1,
          connect: true,
          range: {
            min: [0],
            max: [90]
          }
        });

        var ngModelGet = $parse(attrs.ngModel);
        var $handleNgModelWatch = scope.$watch(attrs.ngModel, function () {
          var values = ngModelGet(scope);
          var begin = parseInt(values.begin || 0, 10);
          var end = parseInt(values.end || 90, 10);

          if (end > 90) {
            el.noUiSlider.set([null, 90]);
          } else if (begin < 0) {
            el.noUiSlider.set([0, null]);
          } else {
            el.noUiSlider.set([begin, end]);
          }
        }, true);

        el.noUiSlider.on('slide', function(values, handle, unencoded) {
          scope.$evalAsync(function() {
            ctrl.$setViewValue({begin: unencoded[0], end: unencoded[1]});
          });
        });

        ctrl.$parsers.push(function (value) {
          return {
            begin: value.begin || 0,
            end: value.end || 90
          };
        });

        var $handlerDestroy = scope.$on('$destroy', function() {
          $handleNgModelWatch();
          $handleNgModelWatch = null;

          el.noUiSlider.off('slide');
          el.noUiSlider.destroy();

          $handlerDestroy();
          $handlerDestroy = null;
        });
      }
    };
  });
