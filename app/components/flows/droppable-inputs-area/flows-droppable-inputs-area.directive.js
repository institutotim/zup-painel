'use strict';

angular
  .module('FlowsDroppableInputsAreaComponentModule', ['StepsServiceModule'])

  .directive('flowsDroppableInputsArea', function (Restangular, StepsService, $interval) {
    return {
      restrict: 'A',
      link: function postLink(scope, element) {
        element.sortable({
          revert: true,
          handle: '.handle',
          forcePlaceholderSize: false,
          placeholder: {
            element: function () {
              return $('<div class="customSortablePlaceholder"><p>Solte para adicionar</p></div>');
            },
            update: angular.noop
          },
          receive: function (event, ui) {
            var inputType = ui.item.attr('name');

            var newInput = {
              id: undefined,
              field_type: inputType,
              title: StepsService.getDefaultFieldLabel(inputType),
              maximum: null,
              minimum: null,
              presence: false,
              position: null,
              values: []
            };

            if (scope.kindHasMultipleOptions(inputType) === true) {
              newInput.values = ['Nova opção'];
            }

            var placeholder = $(this).find('.item');
            var newElementPos = placeholder.index();
            scope.fields.splice(newElementPos, 0, newInput);
            // Blame the first guy
            var self = this;
            var waitForID = $interval(function(){
              if(!_.findWhere({ id: undefined })) {
                var ids = _.compact(_.map($(self).children(), function(fieldDom) { return $(fieldDom).scope().field.id; }));
                Restangular.one('flows', scope.flow.id).one('steps', scope.step.id).all('fields').customPUT({ids: ids});
                $interval.cancel(waitForID);
              }
            }, 500);
            placeholder.remove();
            scope.$apply();
          },
          update: function (event, ui) {
            if(typeof ui.item.attr('flows-step-field') !== 'undefined') {
              var ids = _.map($(ui.item).parent().children(), function(fieldDom) { return $(fieldDom).scope().field.id; });
              Restangular.one('flows', scope.flow.id).one('steps', scope.step.id).all('fields').customPUT({ids: ids});
            }
          }
        });
      }
    };
  });
