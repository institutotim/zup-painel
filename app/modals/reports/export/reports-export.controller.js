(function (angular) {
  'use strict';

  angular
    .module('ReportsExportModalControllerModule', ['ReportsItemsServiceModule'])
    .controller('ReportsExportModalController', ReportsExportModalController)
    .factory('ReportsExportModalService', ReportsExportModalService);

  ReportsExportModalController.$inject = [
    '$scope',
    'ReportsItemsService',
    'promise',
    '$modalInstance',
    '$log'
  ];

  function ReportsExportModalController($scope, ReportsItemsService, promise, $modalInstance, $log) {

    $log.info('ReportsDestroyModalController created.');

    $scope.$on('$destroy', function () {
      $log.info('ReportsDestroyModalController destroyed.');
    });

    $scope.total = ReportsItemsService.total;
    $scope.confirm = _confirm;
    $scope.close = _close;

    function _confirm() {
      promise.resolve();
      $modalInstance.close();
    }

    function _close() {
      promise.reject();
      $modalInstance.close();
    }
  }

  ReportsExportModalService.$inject = [
    '$modal',
    '$q'
  ];

  function ReportsExportModalService($modal, $q) {
    var self = {},
      defer = $q.defer();

    self.open = open;

    function open() {
      $modal.open({
        templateUrl: 'modals/reports/export/reports-export.template.html',
        windowClass: 'reportsExportModal',
        controller: 'ReportsExportModalController',
        resolve: {
          promise: function () {
            return defer;
          }
        }
      });

      return defer.promise;
    }

    return self;
  }
})(angular);
