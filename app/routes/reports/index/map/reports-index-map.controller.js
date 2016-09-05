'use strict';

angular
  .module('ReportsIndexMapControllerModule', [
    'ReportsDestroyModalControllerModule',
    'OnFocusComponentModule',
    'OnBlurComponentModule',
    'ReportsItemsServiceModule'
  ])

  .controller('ReportsIndexMapController', function ($rootScope, $scope, Restangular, $modal, $q, $location, $window, $cookies, ReportsItemsService, $state, $log) {

    $log.debug('ReportsIndexMapController created.');

    var page = 1, perPage = 15;

    $scope.reports = [];
    $scope.zoom = null;
    $scope.clusterize = null;

    // we hide/show map debug
    $rootScope.pageHasMap = true;

    $scope.generateReportsFetchingMapOptions = function() {
      var fetchOptions = $scope.generateReportsFetchingOptions();

      if ($scope.zoom !== null) {
        fetchOptions.zoom = $scope.zoom;
      }

      if ($scope.clusterize !== null) {
        fetchOptions.clusterize = true;
      }

      return fetchOptions;
    };

    $scope.$on('reportsItemsFetching', function () {
      $scope.$parent.loading = true;
    });

    $scope.$on('reportsItemsFetched', function () {
      $scope.$parent.total = ReportsItemsService.total;
      $scope.$parent.loading = false;
    });

    $scope.$on('loadFilters', function (event, reloading) {
      $scope.$broadcast('mapRefreshRequested', true);
    });

    $scope.$on('resetFilters', function (event, reloading) {
      $scope.$broadcast('mapRefreshRequested', true);
    });

    $scope.$on('$destroy', function () {
      $rootScope.pageHasMap = false;

      $log.debug('ReportsIndexMapController destroyed.');
    });
  });
