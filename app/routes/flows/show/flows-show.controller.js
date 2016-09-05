'use strict';

angular
  .module('FlowsShowControllerModule', [
    'FlowsStepsAddModalControllerModule',
    'FlowsStepsDestroyModalControllerModule',
    'FlowsStepsOrderComponentModule',
    'FlowsServiceModule'
  ])

  .controller('FlowsShowController', function ($rootScope, $scope, $stateParams, $modal, FlowsService) {
    var flowId = $stateParams.id;

    $scope.flow = null;

    $scope.loading = true;

    $scope.sortableOptions = {
      containment: 'window',
      axis: 'y',
      placeholder: 'ui-state-highlight',
      stop: function handlerSaveOrder(e, ui) {
        var promise = FlowsService.reorder($scope.flow.id, $scope.flow.my_steps);

        $scope.loading = true;
        promise
          .then(function (response) {
            $scope.showMessage('ok', 'O fluxo foi ordenado com sucesso.', 'success', true);
            $scope.selectVersion(null);
          })
          .catch(function (response) {
            $scope.showMessage('exclamation-sign', 'O fluxo não pode ser ordenado.', 'error', true);
          })
          .finally(function () {
            $scope.loading = false;
          });
      }
    };

    $scope.tableSort = {
      column: 'version_id',
      descending: true
    };

    var addFriendlyVersions = function (flow) {
      angular.forEach(flow.list_versions, function (version, index) {
        version.friendly_id = index + 1;

        if ( flow.version_id === version.version_id ) {
          flow.friendly_version_id = version.friendly_id;
        }
      });
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.tableSort;

      if (sort.column === column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

    $scope.selectedCls = function (column) {
      return column === $scope.tableSort.column && 'sort-' + $scope.tableSort.descending;
    };

    $scope.selectVersion = function (versionId) {
      var promise = FlowsService.fetch(flowId, versionId, { draft: true });

      $scope.loading = true;
      promise.then(function (flow) {
        $scope.loading = false;
        $scope.flow = flow;

        addFriendlyVersions($scope.flow);
      });
    };

    $scope.addStep = function () {
      $modal.open({
        templateUrl: 'modals/flows/steps/add/flows-steps-add.template.html',
        windowClass: 'editStepModal',
        resolve: {
          flow: function () {
            return $scope.flow;
          }
        },
        controller: 'FlowsStepsAddModalController'
      });
    };

    $scope.editStep = function (step) {
      $modal.open({
        templateUrl: 'modals/flows/steps/edit/flows-steps-edit.template.html',
        windowClass: 'editStepModal',
        resolve: {
          flow: function() {
            return $scope.flow;
          },

          step: function() {
            return step;
          }
        },
        controller: 'FlowsStepsEditModalController'
      });
    };

    $scope.removeStep = function (step) {
      $modal.open({
        templateUrl: 'modals/flows/steps/destroy/flows-steps-destroy.template.html',
        windowClass: 'removeModal',
        resolve: {
          flow: function () {
            return $scope.flow;
          },

          step: function () {
            return step;
          }
        },
        controller: 'FlowsStepsDestroyModalController'
      });
    };

    $scope.editFlow = function () {
      $modal.open({
        templateUrl: 'modals/flows/edit/flows-edit.template.html',
        windowClass: 'addFlowModal',
        resolve: {
          flows: function () {
            return null;
          },

          flow: function () {
            return $scope.flow;
          }
        },
        controller: 'FlowsEditModalController'
      })
      .result
      .then(function (flow) {
        $scope.flow = flow;
      });
    };

    $scope.publishFlow = function () {
      var promise = FlowsService.publish($scope.flow.id);

      $scope.loading = true;
      promise
        .then(function(response) {
          $scope.showMessage('ok', 'O fluxo foi publicado com sucesso', 'success', true);
          $scope.selectVersion();
        })
        .catch(function(response) {
          $scope.showMessage('exclamation-sign', 'O fluxo não pode ser publicado', 'error', true);
          $scope.loading = false;
        });
    };

    $scope.setVersion = function(version) {
      var promise = FlowsService.setVersion(version.id, version.version_id);

      $scope.loading = true;
      promise
        .then(function() {
          $scope.showMessage('ok', 'A versão corrente foi atualizada', 'success', true);
          $scope.selectVersion(version.version_id);
        })
        .catch(function(response) {
          $scope.showMessage('exclamation-sign', 'A versão não pode ser utilizada', 'error', true);
          $scope.loading = false;
        });
    };

    $scope.selectVersion();
  });
