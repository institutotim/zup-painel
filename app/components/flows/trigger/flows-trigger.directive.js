'use strict';

angular
  .module('FlowsTriggerComponentModule', [])

  .directive('flowsTrigger', function (Restangular) {
    return {
      restrict: 'A',
      link: function postLink(scope) {

        // let's open the options section as soon as the user creates a new trigger
        scope.editing = (scope.trigger.isNew ? true : false);

        scope.types = [
          {id: '==', name: 'Igual'},
          {id: '!=', name: 'Diferente'},
          {id: '>', name: 'Maior'},
          {id: '<', name: 'Menor'},
          {id: 'inc', name: 'Entre valores'}
        ];

        scope.saveTrigger = function () {

          // Transform conditions
          var conditions = _.map(scope.trigger.trigger_conditions, function (triggerCondition) {
            var condition = {
              "field_id": (angular.isObject(triggerCondition.my_field) ? triggerCondition.my_field.id : null),
              "condition_type": triggerCondition.condition_type,
              "values": triggerCondition.values
            };

            if (angular.isDefined(triggerCondition.id)) {
              condition.id = triggerCondition.id;
            }

            return condition;
          });

          var trigger = {
            return_fields: 'id',
            title: scope.trigger.title,
            trigger_conditions_attributes: conditions,
            action_type: scope.trigger.action_type,
            action_values: scope.trigger.action_values,
            description: scope.trigger.description
          };

          var stepContainer = Restangular.one('flows', scope.$parent.flow.id).one('steps', scope.$parent.step.id).withHttpConfig({treatingErrors: true});

          if (scope.trigger.isNew) {
            scope.triggerPromise = stepContainer.post('triggers', trigger);
          } else {
            scope.triggerPromise = stepContainer.one('triggers', scope.trigger.id).customPUT(trigger);
          }

          scope.triggerPromise
            .then(function (response) {

              if (scope.trigger.isNew) {
                scope.trigger.id = response.data.id;
                scope.trigger.isNew = false;
              }

              scope.editing = false;

              scope.showMessage('ok', 'O gatilho foi atualizado com sucesso!', 'success');
            })
            .catch(function () {
              scope.showMessage('exclamation-sign', 'O gatilho não pode ser salvo', 'error', true);
            });
        };

        scope.newCondition = function () {
          scope.trigger.trigger_conditions.push({
            "my_field": {},
            "condition_type": '==',
            "values": []
          });
        };

        scope.removeCondition = function (condition) {
          // if we have the condition id, we need to delete from the API
          if (angular.isNumber(condition.id)) {
            scope.processingForm = true;

            var deletePromise = Restangular.one('flows', scope.$parent.flow.id).one('steps', scope.$parent.step.id).one('triggers', scope.trigger.id).one('trigger_conditions', condition.id).remove();

            deletePromise.then(function () {
              scope.trigger.trigger_conditions.splice(scope.trigger.trigger_conditions.indexOf(condition), 1);
              scope.processingForm = false;
            });
          } else {
            scope.trigger.trigger_conditions.splice(scope.trigger.trigger_conditions.indexOf(condition), 1);
          }
        };

        scope.toggle = function () {
          scope.editing = !scope.editing;
        }
      }
    };
  });
