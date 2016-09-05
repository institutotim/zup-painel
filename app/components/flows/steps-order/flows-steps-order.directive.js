'use strict';

angular
  .module('FlowsStepsOrderComponentModule', [])

  .directive('flowsStepsOrder', function (Restangular, $timeout) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var pendingNewInput = null;

        scope.updateFieldsOrder = function () {
          var ids = [], cancel = false;

          for (var i = scope.flow.steps.length - 1; i >= 0; i--) {
            if (typeof scope.flow.steps[i].id !== 'undefined') {
              ids[scope.flow.steps[i].position] = scope.flow.steps[i].id;
            }
          }

          // okay, before we update we need to make sure that every item in the list is with it's correct position :-)
          for (var i = ids.length - 1; i >= 0; i--) {
            if (typeof ids[i] === 'undefined') {
              cancel = true;
            }
          }

          if (!cancel) {
            Restangular.one('flows', scope.flow.id).all('steps').customPUT({ids: ids});
          }
        };

        var updateInputsPosition = function (stop) {
          element.find('tbody').each(function () {
            if (typeof $(this).scope().step !== 'undefined') {
              $(this).scope().step.position = $(this).index();
            }
          });

          scope.$apply();

          // update fields order
          if (stop === true) {
            scope.updateFieldsOrder();
          }
        };

        element.sortable({
          cursor: 'move',
          revert: true,
          tolerance: 'pointer',
          handle: '.handle',
          forcePlaceholderSize: false,
          containment: '#flow-step-list',
          placeholder: {
            element: function () {
              return $('<tr class="flow-step-order-placeholder"><td colspan="3">Solte para ordenar</td></tr>');
            },

            update: function () {
              return;
            }
          },
          start: function (event, ui) {
            $(ui.helper).addClass('helper');
            ui.placeholder.height(ui.item.height());
            updateInputsPosition();
          },
          stop: function (event, ui) {
            $(ui.item).removeClass('helper');

            updateInputsPosition(true);
          }
        });
      }
    };
  });
