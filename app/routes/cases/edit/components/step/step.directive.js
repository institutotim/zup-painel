'use strict';

angular
  .module('CaseStepDirectiveModule', ['CaseStepFieldDirectiveModule', 'InventoriesItemsServiceModule', 'CasesServiceModule'])
  .directive('caseStep', function () {
    return {
      restrict: 'E',
      scope: {
        step: '=',
        editable: '=',
        saveInProgress: '=',
        onStepSave: '&',
        onChangeConductor: '&'
      },
      templateUrl: 'routes/cases/edit/components/step/step.template.html',
      controller: function ($scope, $rootScope, InventoriesItemsService, CasesService) {
        $scope.user = $rootScope.me;

        $scope.canChangeResponsible = function(step) {
          if($rootScope.hasPermission('flow_can_change_cases_responsible', step.flow_step.flow_id)) {
            return true;
          }

          return $scope.canExecute(step);
        }

        $scope.canExecute = function (step) {
          if (step.responsible_group) {
            return $scope.canExecuteStepByPermission(step);
          } else {
            return step.conductor && ($scope.user.id === step.conductor.id);
          }
        };

        $scope.canExecuteStepByPermission = function(step) {
          return $rootScope.hasPermission('can_execute_step', step.flow_step.flow_id) ||
            $rootScope.hasPermission('flow_can_execute_all_steps', step.flow_step.flow_id);
        };

        $scope.toggleEditable = function () {
          $scope.editable = !$scope.editable;
        };

        $scope.$watch('step', function (step) {
          if (step) {
            $scope.futureStep = !step.id;
            $scope.stepFilled = !!step.updated_by;
          }
        });

        var extractNormalizedStepForm = function (fields) {
          return _.map(fields, function (field) {
            switch (field.type) {
              case 'inventory_item':
                var value = _.pluck(field.value, 'id');
                return { id: field.id, value: value };
              case 'select':
                var value = field.value ? field.value.value : null;
                return {id: field.id, value: value};
              case 'checkbox':
                var values = [];

                if(field.value) {
                  _.each(field.values, function(option, i){
                    if(field.value[i]) {
                      values.push(option.value);
                    }
                  });
                }

                return {id: field.id, value: values};
              case 'image':
              case 'attachment':
                if (!field.value) {
                  return;
                }
                field.value = _.reject(field.value, function(entry){
                  return !entry.destroy && !entry.content;
                });

                _.each(field.value, function(entry){
                  if(entry.content) {
                    delete entry['url'];
                  }
                });
                return {id: field.id, value: field.value};
              default:
                return {id: field.id, value: field.value};
            }
          });
        };

        $scope.isFormValid = function(){
          return $scope.stepForm.$valid && !_.any($scope.step.flow_step.fields, function(f){ return f.has_errors; });
        };

        $scope.saveStep = function () {
          $scope.formSubmitted = true;
          $scope.displayErrors = true;
          if ($scope.isFormValid()) {
            $scope.displayErrors = false;
            $scope.onStepSave({fields: extractNormalizedStepForm($scope.step.flow_step.fields)});
          }
        };

        $scope.changeConductor = function () {
          $scope.onChangeConductor();
        };

        var getInventoryFieldsForSelector = function(inventory_selector){
          return _.select($scope.step.flow_step.fields, function(field){
            return field.inventory_field && field.field_id == inventory_selector.id;
          });
        };

        $scope.$on('cases:inventory_items_selected', function(e, inventory_selector){
          // TODO: ask data only for the fields that are being used on this case
          var inventory_fields = getInventoryFieldsForSelector(inventory_selector);

          if(_.any(inventory_fields)) {
            var selected_item_id = inventory_selector.value[0].id;
            InventoriesItemsService.fetchOne(selected_item_id).then(function(response){
              var item = response.data.item;

              _.each(inventory_fields, function(inventory_field){
                _.each(item.data, function(datum){
                  if(datum.field.id == inventory_field.origin_field_id) {
                    inventory_field.value = CasesService.denormalizeInventoryFieldValue(inventory_field, datum.content);
                  }
                });
              });
            });
          }
        });

        $scope.$on('cases:inventory_items_removed', function(e, inventory_selector){
          var inventory_fields = getInventoryFieldsForSelector(inventory_selector);

          if(_.any(inventory_fields)) {
            _.each(inventory_fields, function(inventory_field){
              delete inventory_field.value;
            });
          }
        });
      }
    };
  });
