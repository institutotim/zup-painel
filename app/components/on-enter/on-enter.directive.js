(function (angular) {
  'use strict';

  angular
    .module('OnEnterComponentModule', [])
    .directive('onEnter', onEnter);

  function onEnter() {
    return {
      restrict: 'A',
      link: function (scope, elm, attrs) {
        elm.bind('keydown keypress', function (event) {
          if (event.which === 13) {
            scope.$apply(function () {
              scope.$eval(attrs.onEnter);
            });

            event.preventDefault();
          }
        });
      }
    };
  }

})(angular);