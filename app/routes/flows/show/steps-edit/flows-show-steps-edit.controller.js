'use strict';

angular
  .module('FlowsShowStepsEditControllerModule', [
    'FlowsStepsEditModalControllerModule',
    'FlowsCreateValueComponentModule',
    'FlowsDroppableInputsAreaComponentModule',
    'FlowsSingleValueComponentModule',
    'FlowsStepFieldComponentModule',
    'FlowsTriggerComponentModule',
    'InventoryPopoverComponentModule',
    'InventoryPopoverLinkComponentModule',
    'InputsSidebarComponentModule',
    'FlowsDraggableInputComponentModule',
    'FlowsServiceModule',
    'StepsServiceModule',
    'TwoStepSelectorModule',
    'ReportsCategoriesServiceModule',
    'InventoriesCategoriesServiceModule',
    'ItemSelectorDirectiveModule'
  ])

  .controller('FlowsShowStepsEditController', function ($scope, Restangular, $modal, $stateParams, $q, StepsService, FlowsService, InventoriesCategoriesService, ReportsCategoriesService) {
    var flowId = $stateParams.id, stepId = $stateParams.stepId,
      versionId = $stateParams.versionId == 'draft' ? null : $stateParams.versionId;

    $scope.loading = true;
    $scope.currentTab = 'form';

    var flowPromise = FlowsService.fetch(flowId, versionId, {return_fields: ['id', 'title', 'draft', 'initial', 'status', 'steps', 'resolution_states', 'steps_order'].join()});
    var flowsPromise = FlowsService.fetchAll({return_fields: ['id', 'title'].join()});
    var stepPromise = StepsService.fetch(flowId, stepId, versionId);
    var triggersPromise = StepsService.fetchTriggers(flowId, stepId, versionId);

    $scope.flow = {};
    $scope.flows = [];
    $scope.step = {};
    $scope.fields = {};
    $scope.triggers = [];

    $q.all([flowPromise, flowsPromise, stepPromise, triggersPromise]).then(function (responses) {
      $scope.loading = false;

      $scope.flow = responses[0];
      $scope.flows = responses[1];
      $scope.step = responses[2];
      $scope.fields = _.map($scope.step.fields_id, function(field_id){
        return _.findWhere($scope.step.fields, { id: parseInt(field_id, 10) });
      });
      $scope.triggers = responses[3];
    });

    $scope.availableInputs = StepsService.getAvailableFields();

    $scope.sortableOptions = {
      containment: '.flows-triggers',
      axis: 'y',
      placeholder: 'ui-state-highlight',
      stop: function handlerSaveOrder(e, ui) {

        var data = {
          'ids': _.map($scope.triggers, function (trigger) {
            return trigger.id;
          })
        };

        var orderPromise = Restangular
          .one('flows', $scope.flow.id)
          .one('steps', $scope.step.id)
          .withHttpConfig({treatingErrors: true})
          .customPUT(data, 'triggers');

        $scope.loading = true;
        orderPromise
          .then(function (response) {
            $scope.showMessage('ok', 'O gatilho foi ordenado com sucesso.', 'success', true);
          })
          .catch(function (response) {
            $scope.showMessage('exclamation-sign', 'O fluxo não pode ser ordenado.', 'error', true);
          })
          .finally(function () {
            $scope.loading = false;
          });
      }
    };

    $scope.kindHasMultipleOptions = function (kind) {
      for (var i = $scope.availableInputs.normal.length - 1; i >= 0; i--) {
        if ($scope.availableInputs.normal[i].kind === kind) {
          return $scope.availableInputs.normal[i].multipleOptions === true;
        }
      }

      return false;
    };

    // Triggers helpers
    $scope.action_types = [
      {action: 'enable_steps', name: 'Ativar etapa(s)'},
      {action: 'disable_steps', name: 'Desativar etapa(s)'},
      {action: 'finish_flow', name: 'Finalizar fluxo(s)'},
      {action: 'transfer_flow', name: 'Transferir fluxo(s)'}
    ];

    $scope.newTrigger = function () {
      var newTrigger = {
        title: '',
        trigger_conditions: [],
        action_type: 'disable_steps',
        action_values: [],
        description: '',
        isNew: true
      };

      $scope.triggers.push(newTrigger);
    };

    $scope.removeTrigger = function (trigger) {
      $scope.processingForm = true;

      if (!trigger.isNew) {
        $scope.removerTriggerPromise = Restangular.one('flows', $scope.flow.id).one('steps', $scope.step.id).one('triggers', trigger.id).remove();
        $scope.removerTriggerPromise.then(function () {
          $scope.triggers.splice($scope.triggers.indexOf(trigger), 1);
          $scope.processingForm = false;
        });

      } else {
        var deferred = $q.defer();

        $scope.removerTriggerPromise = deferred.promise;
        $scope.removerTriggerPromise.then(function() {
          $scope.triggers.splice($scope.triggers.indexOf(trigger), 1);
          $scope.processingForm = false;
        });

        deferred.resolve(true);
      }
    };

    // Request an update for the step permissions and rollbacks if unsuccessful
    var currentPermissions;
    $scope.updatePermissions = function (value) {
      if (!value) {
        return;
      }

      if (!currentPermissions) {
        currentPermissions = angular.copy(value);
        return;
      }
      var permission_type, groups;
      if (!angular.equals(currentPermissions.can_execute_step, value.can_execute_step)) {
        permission_type = 'can_execute_step';
        groups = value.can_execute_step;
      }
      if (!angular.equals(currentPermissions.can_view_step, value.can_view_step)) {
        permission_type = 'can_view_step';
        groups = value.can_view_step;
      }
      StepsService.updatePermission(flowId, stepId, permission_type, groups).then(function () {
        currentPermissions = angular.copy(value);
        $scope.showMessage(null, null, 'updated-successfuly', false);
      }, function () {
        $scope.permissions = angular.copy(currentPermissions);
      });
    };

    $scope.toggleConductionMode = function () {
      $scope.step.conduction_mode_open = !$scope.step.conduction_mode_open;
      StepsService.update(flowId, stepId, {conduction_mode_open: $scope.step.conduction_mode_open}).then(function () {
        $scope.showMessage(null, null, 'updated-successfuly', false);
      }, function () {
        $scope.step.conduction_mode_open = !$scope.step.conduction_mode_open;
      });
    };

    $scope.$watch('step.permissions', $scope.updatePermissions, true);

    $scope.$on('hidePopovers', function (event, data) {
      // tell each popover to close before opening a new one
      $scope.$broadcast('hideOpenPopovers', data);
    });

    $scope.editStep = function () {
      $modal.open({
        templateUrl: 'modals/flows/steps/edit/flows-steps-edit.template.html',
        windowClass: 'editStepModal',
        resolve: {
          flow: function () {
            return $scope.flow;
          },

          step: function () {
            return $scope.step;
          }
        },
        controller: 'FlowsStepsEditModalController'
      });
    };

    $scope.getCategories = function(field_type) {
      if(field_type == 'report_item') {
        return ReportsCategoriesService.fetchTitlesAndIds;
      } else if (field_type == 'inventory_item') {
        return InventoriesCategoriesService.fetchTitlesAndIds;
      }
    }
  });
