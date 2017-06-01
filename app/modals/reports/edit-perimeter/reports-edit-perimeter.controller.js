(function (angular) {
  'use strict';

  angular
    .module('ReportsEditPerimeterModalControllerModule', ['ReportsPerimetersServiceModule'])
    .controller('ReportsEditPerimeterModalController', ReportsEditPerimeterModalController)
    .factory('ReportsEditPerimeterModalService', ReportsEditPerimeterModalService);

  ReportsEditPerimeterModalController.$inject = [
    '$scope',
    '$rootScope',
    '$modalInstance',
    'Restangular',
    'ReportsPerimetersService',
    'perimeter',
    'promise',
    '$log'
  ];
  function ReportsEditPerimeterModalController($scope, $rootScope, $modalInstance, Restangular, ReportsPerimetersService, perimeter, promise, $log) {
    $log.debug('ReportsEditPerimeterModalController created.');
    $scope.$on('$destroy', function () {
      $log.debug('ReportsEditPerimeterModalController destroyed.');
    });

    $scope.perimeter = angular.copy(perimeter);

    $scope.close = $modalInstance.close;
    $scope.save = _save;

    function _save() {
      $scope.processingForm = true;

      $scope.savePromise = ReportsPerimetersService.updatePerimeter($scope.perimeter);

      $scope.savePromise
        .then(function (response) {
          $rootScope.showMessage('ok', 'Perímetro atualizado com sucesso.', 'success', true);
          $log.debug('Updated perimeter');
          promise.resolve(response);
        })
        .catch(function (err) {
          $scope.showMessage('exclamation-sign', 'Erro atualizando perímetro.', 'error', true);
          $log.debug('Error updating perimeter');
          promise.reject(err);
        })
        .finally(function () {
          $scope.savePromise = null;
          $modalInstance.close();
        });
    }

    function _initialize() {
      $scope.perimeter.solver_group_id = $scope.perimeter.group ? $scope.perimeter.group.id : null;

      Restangular.all('groups').getList({return_fields: 'id,name'})
        .then(function (response) {
          $scope.groups = response.data;
        })
        .catch(function () {
          $scope.showMessage('exclamation-sign', 'Não foi possível carregar os grupos.', 'error', true);
        });
    }

    _initialize();
  }

  ReportsEditPerimeterModalService.$inject = [
    '$modal',
    '$q'
  ];
  function ReportsEditPerimeterModalService($modal, $q) {
    return {
      open: function (perimeter) {
        var deferred = $q.defer();

        $modal.open({
          templateUrl: 'modals/reports/edit-perimeter/reports-edit-perimeter.template.html',
          windowClass: 'editPerimeter',
          resolve: {
            perimeter: function () {
              return perimeter;
            },

            promise: function () {
              return deferred;
            }
          },
          controller: 'ReportsEditPerimeterModalController'
        });

        return deferred.promise;
      }
    };
  }
})(angular);
