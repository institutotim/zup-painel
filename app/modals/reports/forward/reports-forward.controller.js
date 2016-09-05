'use strict';

angular
  .module('ReportsForwardModalControllerModule', [])

  .controller('ReportsForwardModalController', function(Restangular, $rootScope, $scope, $state, $modalInstance, category, report, groupsResponse) {
    $rootScope.resolvingRequest = false;

    $scope.category = category;
    $scope.report = angular.copy(report);
    $scope.groups = groupsResponse.data;

    $scope.filterByIds = function(item) {
      if (report.assigned_group && report.assigned_group.id == item.id) return false;
      if (!~category.solver_groups_ids.indexOf(item.id)) return false;

      return true;
    };

    $scope.save = function() {
      $scope.processing = true;

      var changeStatusPromise = Restangular.one('reports', $scope.category.id).one('items', $scope.report.id).one('forward').customPUT({
        'group_id': $scope.report.group_id, 'comment': $scope.report.comment,
        'return_fields': ''
      });

      changeStatusPromise.then(function() {
        $scope.processing = false;

        $modalInstance.close();

        $scope.showMessage('ok', 'O grupo responsável foi alterado com sucesso.', 'success', true);
        $state.go($state.current, {}, {reload: true});
      });
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
