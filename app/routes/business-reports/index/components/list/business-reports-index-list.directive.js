(function (angular, _) {
  'use strict';

  angular
    .module('BusinessReportsIndexListDirectiveModule', ['BusinessReportsDestroyModalModule', 'BusinessReportsServiceModule'])
    .directive('businessReportsIndexList', businessReportsIndexList);

  businessReportsIndexList.$inject = [];
  function businessReportsIndexList() {
    return {
      restrict: 'E',
      scope: {
        loadContent: '&',
        showEditButton: '=',
        showRemoveButton: '='
      },
      templateUrl: 'routes/business-reports/index/components/list/business-reports-index-list.template.html',
      controller: businessReportsIndexListController
    };
  }

  businessReportsIndexListController.$inject = [
    '$scope',
    '$window',
    '$log',
    '$state',
    'BusinessReportsService',
    '$rootScope',
    'BusinessReportDestroyModalService'
  ];
  function businessReportsIndexListController($scope, $window, $log, $state, BusinessReportsService, $rootScope, BusinessReportDestroyModalService) {
    $log.info('businessReportsIndexListController created.');

    $scope.$on('$destroy', function () {
      $log.info('businessReportsIndexListController destroyed.');
    });

    $scope.loadContent().then(function (reports) {
      $scope.reports = reports;
      $scope.contentLoaded = true;
    }, function () {
      $scope.errorLoadingContent = true;
    });

    var removeReportFromList = function (report) {
      $scope.reports.splice($scope.reports.indexOf(report), 1);
    };

    $scope.deleteReport = function (report) {
      BusinessReportDestroyModalService.open(report).then(removeReportFromList);
    };

    $scope.reloadApplication = function () {
      $window.location.reload(true);
    };

    $scope.openBusinessReport = function (id, event) {
      if (!$rootScope.loading
        && event.target.parentNode.tagName.toLowerCase() != 'a'
        && event.target.tagName.toLowerCase() != 'a'
      ) {
        $state.go('business_reports.show', {reportId: id});
      }
    };

    $scope.duplicateReport = function (report) {
      if ($rootScope.loading) return;
      $rootScope.loading = true;
      BusinessReportsService.find(report.id).then(function (report) {
        delete report.id;
        report.title += ' - cópia';
        report.duplicating = true;
        BusinessReportsService.save(report).then(function () {
          $rootScope.showMessage('ok', 'Relato duplicado com sucesso!', 'success', true);
          $rootScope.loading = false;
          $state.transitionTo($state.current, {}, {
            reload: true,
            inherit: false,
            notify: true
          });
        });
      });
    }
  }

})(angular, _);
