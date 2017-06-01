(function (angular, _) {
  'use strict';

  angular
    .module('ExporterComponentModule', [
      'ExportsServiceModule',
      'ItemsCategoriesSelectModalModule',
      'ReportsExportModalControllerModule'
    ])
    .directive('exporter', ExporterComponent);

  function ExporterComponent() {
    return {
      restrict: 'E',
      template: '<a href="" ng-click="$exporter.export()" ng-transclude></a>',
      scope: {
        kind: '@',
        category: '=',
        filters: '='
      },
      controller: ExporterController,
      controllerAs: '$exporter',
      transclude: true
    };
  }

  ExporterController.$inject = [
    '$rootScope', '$scope', 'ExportsService', 'ItemsCategoriesSelectModalService', 'ReportsExportModalService', '$log'
  ];
  function ExporterController($rootScope, $scope, ExportsService, ItemsCategoriesSelectModalService, ReportsExportModalService, $log) {
    var vm = this;

    vm.export = exportFn;

    function exportFn() {
      if ($scope.kind == 'inventory' && !$scope.category) {
        _askCategory().then(function (category) {
          _exportItem(category.id);
        });
      } else if ($scope.kind == 'inventory') {
        _exportItem($scope.category.id);
      } else {
        ReportsExportModalService.open()
          .then(_exportItem)
          .catch(function () {
            $log.debug('Exportação cancelada');
          });
      }
    }

    function _askCategory() {
      return ItemsCategoriesSelectModalService.open();
    }

    function _exportItem(categoryId) {
      var filters = _.isFunction($scope.filters) ? $scope.filters() : $scope.filters;

      ExportsService
        .export($scope.kind, categoryId, filters)
        .then(function () {
          $rootScope.showMessage(
            'ok', 'Exportação inicializada!', 'success', true
          );
        })
        .catch(function () {
          $rootScope.showMessage(
            'exclamation-sign', 'Ocorreu um problema ao exportar!', 'error', true
          );
        });
    }
  }
})(angular, _);
