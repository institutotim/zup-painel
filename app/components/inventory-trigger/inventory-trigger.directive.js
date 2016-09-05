'use strict';

angular
  .module('InventoryTriggerComponentModule', [])

  .directive('inventoryTrigger', function (Restangular) {
    return {
      restrict: 'A',
      link: function postLink(scope) {

        // let's open the options section as soon as the user creates a new trigger
        if (scope.trigger.isNew) {
          scope.editing = true;
        }

        scope.types = [
          {id: 'equal_to', name: 'Igual'},
          {id: 'different', name: 'Diferente'},
          {id: 'greater_than', name: 'Maior'},
          {id: 'lesser_than', name: 'Menor'},
          {id: 'includes', name: 'Inclui'},
          {id: 'between', name: 'Entre'}
        ];

        scope.removeTrigger = function () {
          if (!scope.trigger.isNew) {
            scope.processingForm = true;

            var deletePromise = Restangular.one('inventory').one('categories', scope.$parent.category.id).one('formulas', scope.trigger.id).remove();

            deletePromise.then(function () {
              scope.$parent.triggers.splice(scope.$parent.triggers.indexOf(scope.trigger), 1);
              scope.processingForm = false;
            });
          } else {
            scope.$parent.triggers.splice(scope.$parent.triggers.indexOf(scope.trigger), 1);
          }
        };

        scope.newCondition = function() {
          scope.trigger.conditions.push({conditionable_id: null, conditionable_type: 'Inventory::Field', operator: 'equal_to', content: null}); // jshint ignore:line
        };

        scope.removeCondition = function (condition) {
          condition._destroy = true;
        };

        scope.saveTrigger = function () {
          scope.processingForm = true;

          var conditions = [];

          for (var i = scope.trigger.conditions.length - 1; i >= 0; i--) {
            var c = scope.trigger.conditions[i];

            var newCondition = {
              conditionable_id: c.conditionable_id,
              conditionable_type: c.conditionable_type,
              operator: c.operator,
              content: c.content,
            };

            if (!_.isUndefined(c.id)) newCondition.id = c.id;
            if (!_.isUndefined(c._destroy) && c._destroy == true) newCondition._destroy = true;

            conditions.push(newCondition);
          };

          var trigger = {
            inventory_status_id: scope.trigger.inventory_status_id,
            conditions: conditions,
            groups_to_alert: [],
            run_formula: scope.trigger.run_formula
          };

          // helpers
          var updateTriggerPromise, triggersContainer = Restangular.one('inventory').one('categories', scope.$parent.category.id);

          if (scope.trigger.isNew === true)
          {
            updateTriggerPromise = triggersContainer.post('formulas', trigger);
          }
          else
          {
            updateTriggerPromise = triggersContainer.one('formulas', scope.trigger.id).customPUT(trigger);
          }

          updateTriggerPromise.then(function() {
            scope.showMessage('ok', 'O gatilho foi atualizado com sucesso!', 'success');
            scope.processingForm = false;
          });
        };

      }
    };
  });
