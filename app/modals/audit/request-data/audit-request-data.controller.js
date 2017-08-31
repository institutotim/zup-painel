(function (angular) {
  'use strict';

  angular
    .module('AuditRequestDataModalModule', [])
    .controller('AuditRequestDataModalController', AuditRequestDataModalController)
    .factory('AuditRequestDataModalService', AuditRequestDataModalService);

  AuditRequestDataModalController.$inject = [
    '$scope',
    '$modalInstance',
    'data',
    '$log'
  ];
  function AuditRequestDataModalController($scope, $modalInstance, data, $log) {

    $log.info('AuditRequestDataModalService created.');

    $scope.$on('$destroy', function () {
      $log.info('AuditRequestDataModalService destroyed.');
    });

    $scope.close = _close;
    $scope.data = data;

    function _close() {
      $modalInstance.close();
    }

    function _initialize() {
    }

    _initialize();
  }

  AuditRequestDataModalService.$inject = [
    '$modal'
  ];
  function AuditRequestDataModalService($modal) {
    return {
      open: function (data) {
        return $modal.open({
          templateUrl: 'modals/audit/request-data/audit-request-data.template.html',
          windowClass: 'businessReportDestroyModal',
          resolve: {
            data: function () {
              return data;
            }
          },
          controller: 'AuditRequestDataModalController'
        }).result;
      }
    }
  }

})(angular);
