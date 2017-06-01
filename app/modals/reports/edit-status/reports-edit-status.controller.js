'use strict';

angular
  .module('ReportsEditStatusModalControllerModule', ['ReportsFeatureFlagsServiceModule', 'caseCreatedModalModule', 'CasesServiceModule'])

  .controller('ReportsEditStatusModalController', function(Restangular, $scope, $rootScope, $state, $modalInstance, category, report, statusesResponse, ReportsFeatureFlagsService, CasesService, caseCreatedModalService) {
    $rootScope.resolvingRequest = false;

    $scope.category = category;
    $scope.report = angular.copy(report);
    $scope.caseUsers = [];

    $scope.category.statuses = statusesResponse.data;
    $scope.selected_status_id = $scope.report.status_id;

    _.each($scope.category.statuses, function(status) {
      status.permittedGroups = [status.responsible_group];
    });

    $scope.report.privateComment = true;

    $scope.changeStatus = function(status) {
      $scope.selected_status_id = status.id;
      $scope.status = status;
    };

    ReportsFeatureFlagsService.getFeatureFlags().then(function (response) {
      ReportsFeatureFlagsService.convertFeaturesFlagsFrom(response.data).and().addInto($scope)
    });

    $scope.save = function () {
      $scope.processing = true;

      var visibility = 0;

      if ($scope.report.privateComment) visibility = 1;

      var putData = {
        'status_id': $scope.selected_status_id,
        'comment': $scope.report.comment,
        'comment_visibility': visibility,
        'replicate': !!$scope.report.replicate
      };

      if ($scope.caseUsers[0]) {
        putData['case_conductor_id'] = $scope.caseUsers[0].id;
      }

      var changeStatusPromise = Restangular.one('reports', $scope.category.id).one('items', $scope.report.id).one('update_status').customPUT(putData,
        '?return_fields=status_id,case.id,case.created_at,case.updated_at,case.status,case.initial_flow.title'); // jshint ignore:line

      changeStatusPromise.then(function (response) {
        $scope.report.status_id = $scope.selected_status_id;

        if (response.data.case) {
          $scope.report.case = CasesService.denormalizeCase(response.data.case);
        }

        $scope.processing = false;

        $modalInstance.close();

        if (putData['case_conductor_id']) {
          caseCreatedModalService.open(response.data.case);
        }

        $scope.showMessage('ok', 'O estado do relato foi alterado com sucesso.', 'success', true);
        $state.go($state.current, {}, {reload: true});
      });
    };

    $scope.close = function () {
      $modalInstance.close();
    };
  });
