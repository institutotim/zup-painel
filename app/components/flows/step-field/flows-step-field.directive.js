'use strict';

angular
  .module('FlowsStepFieldComponentModule', ['FlowsServiceModule', 'StepsServiceModule'])
  .directive('flowsStepField', function (Restangular, TwoStepSelector, FlowsService, StepsService, $q) {
    return {
      restrict: 'A',
      link: function postLink($scope) {
        var save = function () {
          $scope.savingField = true;
          var fieldPromise = Restangular.one('flows', $scope.flow.id).one('steps', $scope.step.id).post('fields', $scope.field);

          fieldPromise.then(function (response) {
            var updatedField = StepsService.fieldDenormalizer(response.data);
            $scope.fields[$scope.fields.indexOf($scope.field)] = updatedField;
            $scope.field = updatedField;
            $scope.savingField = false;
          });
        };

        var update = function () {
          return Restangular.one('flows', $scope.flow.id).one('steps', $scope.step.id)
            .one('fields', $scope.field.id).customPUT($scope.field)
            .then(function (response) {
              $scope.showMessage(null, null, 'updated-successfuly', false);
              var updatedField = StepsService.fieldDenormalizer(response.data);
              $scope.field = _.extend($scope.fields[$scope.fields.indexOf($scope.field)], updatedField);
            });
        };

        var editPreviousField = function () {
          var selection;
          if ($scope.field.previous_field) {
            selection = {};
            selection[$scope.field.previous_field_step_id] = [{
              id: $scope.field.previous_field.id,
              title: $scope.field.previous_field.title
            }];
          }
          TwoStepSelector.open(selection, 'Selecione os campos desejados', false, 'Etapas', FlowsService.getPreviousStepList($scope.flow.id, $scope.step.id),
            'Campos', function (step) {
              return StepsService.fetchFields($scope.flow.id, step.id, $scope.step.version_id, {
                display_type: 'full',
                return_fields: ['id', 'title'].join()
              });
            }).then(function (selection) {
              var step_id = _.keys(selection)[0];
              $scope.field.origin_field_id = selection[step_id][0].id;
              if (!$scope.field.id) {
                $scope.field.title = selection[step_id][0].title;
                save();
              } else {
                if ($scope.field.title == $scope.field.previous_field.title) {
                  $scope.field.title = selection[step_id][0].title;
                }
                update();
              }
            }, function () {
              if (!$scope.field.id) {
                $scope.fields.splice($scope.fields.indexOf($scope.field), 1);
              }
            });
        };

        var editInventoryItemField = function () {
          $scope.savingField = true;
          var selection;

          if ($scope.field.origin_field_id) {
            selection = {};
            selection[$scope.field.field_id] = [$scope.field.origin_field_id];
          }

          TwoStepSelector.open(selection,
            'Selecione o campo de item de inventário desejado',
            false,
            'Seletores de itens de inventário',
            FlowsService.getInventoryItemFields($scope.flow.id, $scope.step.id),
            'Campos', function (field) {
              var deferred = $q.defer();
              var fields = _.flatten(_.map(field.category_inventory[0].sections, function(section){
                _.each(section.fields, function(field){
                  if(field.label) {
                    field.title = field.label;
                  }
                });
                return section.fields;
              }));

              deferred.resolve(fields);
              $scope.field.field_id = field.id;

              return deferred.promise;
            }).then(function (selection) {
              var step_id = _.keys(selection)[0];
              $scope.field.origin_field_id = selection[step_id][0].id;

              if (!$scope.field.id) {
                $scope.field.title = selection[step_id][0].title;
                save();
              } else {
                if ($scope.field.title == $scope.field.category_inventory_field.title) {
                  $scope.field.title = selection[step_id][0].title;
                }

                update();
              }
              $scope.savingField = false;
            }, function () {
              if (!$scope.field.id) {
                $scope.fields.splice($scope.fields.indexOf($scope.field), 1);
              }

              $scope.savingField = false;
            });
        };

        // Init code – run on field instantiation
        if (!$scope.field.id) {
          switch ($scope.field.field_type) {
            case 'previous_field':
              editPreviousField();
              break;
            case 'inventory_field':
              editInventoryItemField();
              break;
            default:
              save();
              break;
          }
        }

        $scope.editField = function () {
          switch ($scope.field.field_type) {
            case 'previous_field':
              editPreviousField();
              break;
            case 'inventory_field':
              editInventoryItemField();
              break;
            default:
              return false;
              break;
          }

          return true;
        };

        $scope.saveTitle = function () {
          update();
          $scope.editingLabel = false;
        };

        $scope.saveField = function () {
          update();
          $scope.popover.options = false;
        };

        $scope.removeField = function () {
          Restangular.one('flows', $scope.flow.id).one('steps', $scope.step.id)
            .one('fields', $scope.field.id).remove()
            .then(function () {
              $scope.fields.splice($scope.fields.indexOf($scope.field), 1);
              $scope.showMessage(null, null, 'updated-successfuly', false);
            });
          $scope.field.destroy = true;
        };
      }
    };
  });
