(function (angular, _) {
  'use strict';

  angular
    .module('AuditIndexControllerModule', [
      'AuditServiceModule',
      'AuditRequestDataModalModule'
    ])
    .controller('AuditIndexController', AuditIndexController);

  AuditIndexController.$inject = [
    '$scope',
    '$rootScope',
    'AuditService',
    'AuditRequestDataModalService',
    '$log'
  ];
  function AuditIndexController($scope, $rootScope, AuditService, AuditRequestDataModalService, $log) {
    $log.info('AuditIndexController created.');
    $scope.$on('$destroy', function () {
      $log.info('AuditIndexController destroyed.');
    });

    var _page = 1, _perPage = 15;

    $scope.auditions = [];
    $scope.getData = _getData;
    $scope.changeSorting = _changeSorting;
    $scope.selectedCls = _selectedCls;
    $scope.showRequestData = _showRequestData;

    function _showRequestData(audition) {
      var request_data = {
        headers: audition.headers,
        body: audition.request_body
      };
      AuditRequestDataModalService.open(request_data);
    }

    $scope.sort = {
      column: 'updated_at',
      descending: true
    };

    function _changeSorting(column) {
      var sort = $scope.sort;

      if (sort.column === column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    }

    function _selectedCls(column) {
      return column === $scope.sort.column && 'sort-' + $scope.sort.descending;
    }

    function _getData() {
      if ($scope.loading === true) {
        return;
      }

      if (AuditService.total && (((_page - 1) * _perPage) >= AuditService.total)) {
        return;
      }

      $scope.loading = true;

      var options = {};
      options.page = _page;
      options.per_page = _perPage;

      var auditPromise = AuditService.fetchAll(options);

      // Get all auditions
      auditPromise.then(function (auditions) {
        _page++;
        $scope.auditions = $scope.auditions.concat(auditions);
        $scope.total = AuditService.total;
      });

      auditPromise.catch(function (err) {
        $log.error(err);
        $scope.total = 0;
        AuditService.cleanCache();
        $rootScope.showMessage('exclamation-sign', 'Falha ao carregar audições.', 'error');
      });

      auditPromise.finally(function () {
        $scope.loading = false;
      });
    }

    function _initialize() {
    }

    _initialize();
  }

})(angular, _);
