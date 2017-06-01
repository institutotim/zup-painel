(function (angular) {
  'use strict';

  angular
    .module('ExportsIndexControllerModule', [
      'ExportsServiceModule',
      'SearchBoxComponentModule'
    ])
    .controller('ExportsIndexController', ExportsIndexController);

  ExportsIndexController.$inject = ['$scope', 'ExportsService'];
  function ExportsIndexController($scope, ExportsService) {
    var vm = this;
    var sortOptions = { column: 'created_at', descending: true };

    vm.exports = [];

    vm.loading = false;
    vm.pagination = { page: 1, per_page: 25, last_page: false };

    vm.getExports = getExports;
    vm.removeExport = removeExport;

    vm.changeSorting = changeSorting;
    vm.selectedCls = selectedCls;

    function getExports() {
      var options = {
        page: vm.pagination.page,
        per_page: vm.pagination.per_page,
        sort: sortOptions.column,
        order: sortOptions.descending ? 'desc' : 'asc'
      };

      vm.loading = true;
      return ExportsService
        .fetchAll(options)
        .then(function (exports) {
          if (exports.length <= 0) {
            vm.pagination.last_page = true;
            return;
          }

          vm.exports = vm.exports.concat(_.map(exports, ExportDecorator));
          vm.pagination.page++;
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function removeExport(exportItem) {
      return ExportsService
        .remove(exportItem.id)
        .then(function () {
          vm.exports.splice(vm.exports.indexOf(exportItem), 1);

          $scope.showMessage(
            'ok', 'Exportação deletada com sucesso!', 'success', true
          );
        });
    }

    function reload() {
      vm.pagination.page = 1;
      vm.pagination.last_page = false;
      vm.exports = [];

      getExports();
    }

    function ExportDecorator(expt) {
      var statusDecorator = function () {
        return ({
          pendent: { slug: 'pendent', humanize: 'EM ANDAMENTO', icon: 'time' },
          processed: { slug: 'processed', humanize: 'EXPORTAÇÃO REALIZADA', icon: 'ok' },
          failed: { slug: 'failed', humanize: 'ERRO: FALHA AO EXPORTAR', icon: 'warning-sign' }
        })[expt.status];
      };

      var kindDecorator = function () {
        if (expt.kind == 'inventory') {
          return { slug: 'inventory', humanize: 'Inventário - ' + expt.category.title };
        } else if (expt.kind == 'report') {
          return { slug: 'report', humanize: 'Relato' };
        }

        return expt.kind;
      };

      return _.extend(expt, {
        kind: kindDecorator(),
        status: statusDecorator()
      });
    }

    function changeSorting(column) {
      if (sortOptions.column === column) {
        sortOptions.descending = !sortOptions.descending;
      } else {
        sortOptions.column = column;
        sortOptions.descending = false;
      }

      reload();
    }

    function selectedCls(column) {
      return column === sortOptions.column && 'sort-' + sortOptions.descending;
    }
  }
})(angular);
