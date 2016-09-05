'use strict';

angular
  .module('ReportsIndexNotificationsControllerModule', [
    'ReportsDestroyModalControllerModule',
    'OnFocusComponentModule',
    'OnBlurComponentModule',
    'ReportsCategoriesNotificationsServiceModule',
    'angular-toArrayFilter'
  ])

  .controller('ReportsIndexNotificationsController', function ($rootScope, $scope, Restangular, $modal, $q, $location, $window, $cookies, ReportsCategoriesNotificationsService, $state, $log) {

    $log.debug('ReportsIndexNotificationsController created.');

    var page = 1, perPage = 15;

    $scope.loadingPagination = false;
    $scope.$parent.total = 0;
    $scope.notifications = [];

    // One every change of page or search, we create generate a new request based on current values
    var getData = $scope.getData = function () {
      if ($scope.$parent.loadingPagination === false) {
        $scope.$parent.loadingPagination = true;

        var fetchOptions = $scope.generateReportsFetchingOptions();

        fetchOptions.page = +page || 1;
        fetchOptions.per_page = +perPage || 15;

        var promise = ReportsCategoriesNotificationsService.searchNotifications(fetchOptions);

        promise.then(function (r) {
          page++;
          $scope.notifications = r;

          var lastPage = Math.ceil($scope.$parent.total / perPage);

          if (page === (lastPage + 1)) {
            $scope.$parent.loadingPagination = null;
          }
          else {
            $scope.$parent.loadingPagination = false;
          }

          $scope.$parent.loading = false;
        });

        return promise;
      }
    };

    $scope.$on('notificationsFetched', function () {
      $scope.$parent.total = ReportsCategoriesNotificationsService.total;
      $scope.$parent.loading = false;
    });

    $scope.$on('loadFilters', function (event, reloading) {
      // reset pagination
      ReportsCategoriesNotificationsService.cleanCache();
      page = 1;
      $scope.$parent.loadingPagination = false;

      if (reloading === true) {
        $scope.$parent.reloading = true;
      }

      $scope.$parent.loadingContent = true;

      getData().then(function (resp) {
        $scope.$parent.loadingContent = false;
        $scope.notifications = resp;

        if (reloading === true) {
          $scope.$parent.reloading = false;
        }
      });
    });

    $scope.getDaysTxt = function(d) {
      var days = (_.isNull(d) || _.isUndefined(d)) ? 0 : d;
      return days < 0 ?  (Math.abs(days) + ' dia' + (days === -1 ? '' : 's') + ' atrás') : (days + ' dia' + (days === 1 ? '' : 's') );
    };

    $scope.$on('$destroy', function () {
      $log.debug('ReportsIndexNotificationsController destroyed.');
    });
  });
