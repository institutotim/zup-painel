'use strict';


angular
  .module('CaseDirectiveModule', [
    'CasesServiceModule',
    'CaseStepsDirectiveModule',
    'CaseStepDirectiveModule',
    'CasesSelectConductorModalModule',
    'CasesInactiveModalModule',
    'CasesFinishModalModule',
    'CaseHistoryDirectiveModule'
  ])
  .directive('case', function (CasesService, CasesSelectConductorModalService, CasesInactiveModalService, CasesFinishModalService) {
    return {
      restrict: 'E',
      scope: {
        id: '=',
        stepId: '=' // Refers to the CaseStep object from the API
      },
      templateUrl: 'routes/cases/edit/components/case/case.template.html',
      controller: function ($scope, $rootScope, $state) {
        $scope.currentTab = 'steps';
        $scope.stepId = $scope.stepId || null;
        $scope.loading = true;
        $scope.user = $rootScope.me;

        $scope.canExecute = function (step) {
          if ($rootScope.hasPermission('manage_cases')) {
            return true;
          } else if(step.responsible_group) {
            return $rootScope.hasPermission('can_execute_step', step.step_id);
          } else {
            return step.conductor && ($scope.user.id === step.conductor.id);
          }
        };

        $scope.canManageCase = function() {
          return $rootScope.hasPermission('manage_cases');
        };

        var updateCaseFromResponse = function (kase) {
          $scope.loading = false;
          $scope.saveInProgress = false;
          $scope.kase = kase;
          if (!$scope.stepId) {
            $scope.step = kase.current_step;
          } else {
            $scope.step = _.findWhere(kase.steps, {id: $scope.stepId});
          }

          if ($scope.canExecute($scope.step)) {
            $scope.step.editable = kase.current_step.id == $scope.step.id && !$scope.step.executed;
          } else {
            $scope.step.editable = false;
          }
        };

        var onError = function () {
          $rootScope.showMessage('exclamation-sign', 'Caso não encontrado', 'error', true);
          $state.go('cases.list');
        };

        // Initial load
        CasesService.fetch($scope.id)
          .then(updateCaseFromResponse)
          .catch(onError);

        $scope.selectStep = function (step) {
          if (step.id) {
            $scope.step = step;
          } else {
            $scope.step = _.filter($scope.kase.next_steps, function (next_step) {
              return next_step.flow_step.id == step.flow_step.id;
            })[0];
          }
        };

        $scope.saveStep = function (fields) {
          $scope.saveInProgress = true;

          var data = {
            step_id: $scope.step.step_id,
            fields: fields
          };

          CasesService.saveStep($scope.kase.id, data)
            .then(function (kase) {
              $scope.saveInProgress = false;
              updateCaseFromResponse(kase);

              if (kase.next_steps_ids.length > 0) {
                $scope.changeConductor({nextStep: true});
              } else {
                $scope.finishCase($scope.kase);
              }
            });
        };

        $scope.changeConductor = function (options) {
          var step;

          if (options && options.nextStep === true) {
            step = $scope.kase.next_steps[0].flow_step;
          } else {
            step = $scope.step.flow_step;
          }

          CasesSelectConductorModalService
            .open($scope.kase, step)
            .then(updateCaseFromResponse);
        };

        $scope.inactiveCase = function (kase) {
          CasesInactiveModalService
            .open(kase)
            .then(function () {
              $state.go('cases.list');
            });
        };

        $scope.finishCase = function (kase) {
          CasesFinishModalService
            .open(kase)
            .then(function () {
              kase.status = 'Finalizado';
            })
        };

        var HEADER_HEIGHT = 140;//px
        $(".chat-window").height($(document).innerHeight() - HEADER_HEIGHT);
      }
    };
  });
