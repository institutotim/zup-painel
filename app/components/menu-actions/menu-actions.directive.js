(function (angular) {
  'use strict';

  angular
    .module('MenuActionsComponentModule', [])
    .directive('menuActions', MenuActionsComponent)
    .directive('menuAction', MenuActionComponent);

  MenuActionsComponent.$inject = ['$templateCache', '$compile'];
  function MenuActionsComponent($templateCache, $compile) {
    return {
      restrict: 'E',
      templateUrl: 'components/menu-actions/menu-actions.template.html',
      transclude: true,
      link: MenuActionsLink
    };

    function MenuActionsLink(scope, element, attr, ctrl, transclude) {
      var content = $('<ul/>', {
        class: 'menu-actions-list'
      }).append(transclude());

      var actionsBtn = $(element).find('.menu-actions-button');

      actionsBtn.popover({
        trigger: 'focus',
        placement: 'bottom',
        content: content,
        html: true
      });

      actionsBtn.on('shown.bs.popover', function () {
        $('.menu-actions-item a').click(function () {
          actionsBtn.popover('hide');
        });
      });
    }
  }

  MenuActionComponent.$inject = [];
  function MenuActionComponent() {
    return {
      restrict: 'E',
      require: '^menuActions',
      template: '<li class="menu-actions-item" ng-transclude></li>',
      transclude: true,
      replace: true
    }
  }
})(angular);
