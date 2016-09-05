'use strict';

angular
  .module('InventoryEditLabelComponentModule', [])
  .directive('inventoryEditLabel', function ($timeout, $rootScope) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {

        scope.editLabel = function() {
          if (attrs.inventoryEditLabel === 'section')
          {
            scope.label = angular.copy(scope.section.title);
            scope.editingSectionLabel = true;
          }
          else
          {
            scope.label = angular.copy(scope.field.label);
            scope.editingLabel = true;
          }

          $timeout(function() {
            element.find('.editLabelField').focus();
          });
        };

        scope.saveLabel = function() {
          if (scope.label.length === 0)
          {
            $rootScope.showMessage('exclamation-sign', 'Você não pode deixar o título do campo em branco.', 'error');

            return;
          }

          if (attrs.inventoryEditLabel === 'section')
          {
            scope.section.title = scope.label;
            scope.editingSectionLabel = false;
          }
          else
          {
            scope.field.label = scope.label;
            scope.editingLabel = false;
          }
        };

        // detect "esc" key on input
        element.find('.editLabelField').keyup(function(e) {
          if (e.keyCode === 13)
          {
            scope.saveLabel();

            scope.$apply();
          };

          if (e.keyCode === 27)
          {
            if (attrs.inventoryEditLabel === 'section')
            {
              scope.editingSectionLabel = false;
            }
            else
            {
              scope.editingLabel = false;
            }

            scope.$apply();
          };
        });
      }
    };
  });
