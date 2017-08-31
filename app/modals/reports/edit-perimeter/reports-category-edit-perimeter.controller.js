(function (angular, _) {
  'use strict';

  angular
    .module('ReportsCategoryEditPerimeterModalControllerModule', ['ReportsPerimetersServiceModule'])
    .controller('ReportsCategoryEditPerimeterModalController', ReportsCategoryEditPerimeterModalController)
    .factory('ReportsCategoryEditPerimeterModalService', ReportsCategoryEditPerimeterModalService);

  ReportsCategoryEditPerimeterModalController.$inject = [
    '$scope',
    '$modalInstance',
    'Restangular',
    'ReportsPerimetersService',
    'perimeter',
    'promise',
    '$log'
  ];
  function ReportsCategoryEditPerimeterModalController($scope, $modalInstance, Restangular, ReportsPerimetersService, perimeter, promise, $log) {
    $log.debug('ReportsCategoryEditPerimeterModalController created.');
    $scope.$on('$destroy', function () {
      $log.debug('ReportsCategoryEditPerimeterModalController destroyed.');
    });

    $scope.perimeter = angular.copy(perimeter);

    $scope.close = $modalInstance.close;
    $scope.save = _save;

    function _save() {
      if (!_.isEqual(perimeter, $scope.perimeter)) {
        $scope.perimeter.__isDirty = function () {
          return true;
        }
      }
      promise.resolve($scope.perimeter);
      $modalInstance.close();
    }

    function _initialize() {
      $scope.perimeter.solver_group_id = $scope.perimeter.group ? $scope.perimeter.group.id : null;

      // Load groups
      Restangular.all('groups').getList({return_fields: 'id,name'})
        .then(function (response) {
          $scope.groups = response.data;
        })
        .catch(function () {
          $scope.showMessage('exclamation-sign', 'Não foi possível carregar os grupos.', 'error', true);
        });

      // Load perimeters
      ReportsPerimetersService.fetchAll()
        .then(function (perimeters) {
          $scope.perimeters = _.filter(perimeters, function (perimeter) {
            return _.isEqual(perimeter.status, 'imported');
          });
        });
    }

    _initialize();
  }

  ReportsCategoryEditPerimeterModalService.$inject = [
    '$modal',
    '$q'
  ];
  function ReportsCategoryEditPerimeterModalService($modal, $q) {
    return {
      open: function (perimeter) {
        var deferred = $q.defer();

        $modal.open({
          templateUrl: 'modals/reports/edit-perimeter/reports-category-edit-perimeter.template.html',
          windowClass: 'editPerimeter',
          resolve: {
            perimeter: function () {
              return perimeter;
            },

            promise: function () {
              return deferred;
            }
          },
          controller: 'ReportsCategoryEditPerimeterModalController'
        });

        return deferred.promise;
      }
    };
  }

})(angular, _);
