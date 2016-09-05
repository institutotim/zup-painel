'use strict';

angular
  .module('CasesSelectConductorModalModule', [
    'UsersSelectorInlineModule',
    'CasesServiceModule'
  ])
  .controller('CasesSelectConductorModalController', function ($scope, $modalInstance, CasesService, kase, step) {
    $scope.responsible = {
      user: [],
      group: []
    };

    $scope.permittedGroups = step.permissions.can_execute_step;
    $scope.isConductionModeOpen = step.conduction_mode_open;

    $scope.confirm = function () {
      var data = {
        step_id: step.id
      };

      if (!_.isUndefined($scope.responsible.user[0])) {
        data.responsible_user_id = $scope.responsible.user[0].id;
      } else if (!_.isUndefined($scope.responsible.group[0])) {
        data.responsible_group_id = $scope.responsible.group[0].id;
      }

      return (
        CasesService
          .saveStep(kase.id, data)
          .then(function (kase) {
            $modalInstance.close(kase);
          })
      );
    };

    $scope.close = function() {
      $modalInstance.dismiss();
    };
  })
  .factory('CasesSelectConductorModalService', function ($modal) {
    return {
      open: function (kase, step) {
        return (
          $modal.open({
            templateUrl: 'modals/cases/select-conductor/cases-select-conductor.template.html',
            windowClass: 'casesSelectConductorModal',
            resolve: {
              kase: function () {
                return kase;
              },
              step: function () {
                return step;
              }
            },
            controller: 'CasesSelectConductorModalController',
            controllerAs: 'casesSelectConductorModalCtrl'
          }).result
        );
      }
    };
  });
