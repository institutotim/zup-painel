'use strict';

angular
  .module('InventoryDroppableInputsAreaComponentModule', [])

  .directive('inventoryDroppableInputsArea', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var pendingNewInput = null;

        var updateInputsPosition = function() {
          element.find('.input').each(function() {
            $(this).scope().field.position = $(this).index();
          });

          scope.$apply();
        };

        element.sortable({
          revert: true,
          handle: '.handle',
          forcePlaceholderSize: false,
          placeholder: {
            element: function() {
              return $('<div class="customSortablePlaceholder"><p>Solte para adicionar</p></div>');
            },

            update: function() {
              return;
            }
          },
          receive: function(event, ui) {
            var inputType = ui.item.attr('name'), inputName = ui.item.find('p').html();

            var newInput = {
              toRemove: false,
              kind: inputType,
              label: 'Novo "' + inputName + '"',
              title: null,
              location: false,
              maximum: null,
              minimum: null,
              required: false,
              size: 'M',
              inventory_fields_can_view: [], // jshint ignore:line
              inventory_fields_can_edit: [], // jshint ignore:line
              field_options: [], // jshint ignore:line
              position: null
            };

            pendingNewInput = newInput;
          },
          update: function(event, ui) {
            var newElementPos = $(ui.item).index();

            if (pendingNewInput !== null)
            {
              // no need to have a new element added to the DOM, angular will do automatically with ng-repeat
              $(this).find('.item').remove();

              pendingNewInput.position = newElementPos;

              // find which element has the same position, and add 0.5 to it's position so the new element is rendered before the old one
              for (var i = scope.section.fields.length - 1; i >= 0; i--) {
                if (scope.section.fields[i].position === newElementPos)
                {
                  scope.section.fields[i].position = scope.section.fields[i].position + 0.5;
                }
              }

              scope.section.fields.push(pendingNewInput);

              scope.$apply();

              pendingNewInput = null;
            }
          },
          start: function(event, ui) {
            $(ui.helper).addClass('helper');

            updateInputsPosition();
          },
          stop: function(event, ui) {
            $(ui.item).removeClass('helper');

            updateInputsPosition();
          }
        });
      }
    };
  });
