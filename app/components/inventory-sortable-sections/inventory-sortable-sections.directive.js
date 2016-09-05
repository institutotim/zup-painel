'use strict';

angular
  .module('InventorySortableSectionsComponentModule', [])

  .directive('inventorySortableSections', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        var updateSectionPosition = function() {
          element.find('.section').each(function() {
            $(this).scope().section.position = $(this).index();
          });

          scope.$apply();
        };

        element.sortable({
          revert: true,
          handle: '.handle',
          forcePlaceholderSize: false,
          placeholder: {
            element: function() {
              return $('<div class="customSortablePlaceholder"><p>Solte para re-ordenar</p></div>');
            },

            update: function() {
              return;
            }
          },
          start: function(event, ui) {
            $(ui.helper).addClass('helper');

            updateSectionPosition();
          },
          stop: function(event, ui) {
            $(ui.item).removeClass('helper');

            updateSectionPosition();
          }
        });
      }
    };
  });
