'use strict';

angular
  .module('FlowsDraggableInputComponentModule', [])

  .directive('flowsDraggableInput', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        element.draggable({
          connectToSortable: '.droppableInputsArea',
          revert: 'invalid',
          helper: function() {
            return $('<div class="customDraggableHelper">' + element.find('p').html() + '</div>');
          },
          start: function(e, ui) {
            $(ui.helper).css('width', 'auto').css('height', 'auto');
          }
        });
      }
    };
  });
