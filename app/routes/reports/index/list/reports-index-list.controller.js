'use strict';

/*global angular, _*/
angular
  .module('ReportsIndexListControllerModule', [
    'ReportsDestroyModalControllerModule',
    'OnFocusComponentModule',
    'OnBlurComponentModule',
    'ReportsItemsServiceModule',
    'angular-toArrayFilter',
    'ConfigServiceModule'
  ])

  .controller('ReportsIndexListController', function ($rootScope, $scope, Restangular, $modal, $q, $location, $window, $cookies, ReportsItemsService, $state, $log, ConfigService) {

    $log.debug('ReportsIndexListController created.');

    var page = 1, perPage = 15;

    $scope.loadingPagination = false;
    $scope.$parent.total = 0;
    $scope.reports = [];

    // sorting the tables
    $scope.sort = {
      column: 'created_at',
      descending: true
    };

    $scope.sortableColumns = {
      'protocol': true,
      'address': true,
      'user': true,
      'reporter': true,
      'created_at': true,
      'category': true,
      'assignment': true,
      'priority': true
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;

      if (sort.column === column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }

      ReportsItemsService.resetCache();
      $scope.reload();
    };

    $scope.getColumnClasses = function(column){
      var defaultClass = 'column-' + column.type;
      if($scope.sortableColumns[column.type]) {
        defaultClass += ' sort-table ' + $scope.selectedCls(column.type);
      }
      return defaultClass;
    };

    $scope.selectedCls = function (column) {
      return column === $scope.sort.column && 'sort-' + $scope.sort.descending;
    };

    $scope.deleteReport = function (report) {
      $modal.open({
        templateUrl: 'modals/reports/destroy/reports-destroy.template.html',
        windowClass: 'removeModal',
        resolve: {
          removeReportFromList: function () {
            return function (report) {
              $scope.$parent.total--;
              $scope.reports.splice($scope.reports.indexOf(report), 1);
            };
          },

          report: function () {
            return report;
          }
        },
        controller: 'ReportsDestroyModalController'
      });
    };

    var getReturnFieldsForColumns = function (columns) {
      var defaultFields = ['id', 'status_id', 'category_id', 'overdue',
                           'description', 'images'];

      var customFieldFilter = function (field) {
        return field.type == 'custom_field';
      };

      if (_.any(_.select(columns, customFieldFilter))) {
        defaultFields.push('custom_fields');
      }

      columns = _.reject(columns, function (column) {
        return column.type == 'custom_field';
      });

      columns = _.map(columns, function (c) {
        switch (c.type) {
          case 'category':
            return 'category.title';
          case 'reporter':
            return ['reporter.id', 'reporter.name'].join();
          case 'user':
            return ['user.id', 'user.name'].join();
          case 'assignment':
            return ['assigned_group.name', 'assigned_group.title', 'assigned_user.name', 'assigned_user.id'].join();
          case 'priority':
            return 'category.priority_pretty';
          default:
            return c.type;
        }
      });

      return _.union(defaultFields, columns).join();
    };

    // One every change of page or search, we create generate a new request based on current values
    var getData = $scope.getData = function () {
      var deferred = $q.defer();

      if ($scope.$parent.loadingPagination === false) {
        $scope.$parent.loadingPagination = true;

        var fetchOptions = $scope.generateReportsFetchingOptions();

        if ($scope.sort.column !== '') {
          fetchOptions.sort = $scope.sort.column;
          fetchOptions.order = $scope.sort.descending ? 'desc' : 'asc';
        }

        fetchOptions.page = +page || 1;
        fetchOptions.per_page = +perPage || 15;

        ConfigService.getReportsColumns().then(function (reportsColumns) {
          $scope.activeColumns = _.filter(reportsColumns, function (c) {
            return c.active;
          });

          fetchOptions.return_fields = getReturnFieldsForColumns($scope.activeColumns);

          var promise = ReportsItemsService.fetchAll(fetchOptions);

          promise.then(function (reports) {
            page++;
            $scope.reports = reports;

            var lastPage = Math.ceil($scope.total / perPage);

            if (page === (lastPage + 1)) {
              $scope.$parent.loadingPagination = null;
            } else {
              $scope.$parent.loadingPagination = false;
            }

            $scope.$parent.loading = false;

            deferred.resolve($scope.reports);
          });
        });

        return deferred.promise;
      }
    };

    $scope.getReportPopoverTemplate = ReportsItemsService.getReportPopoverTemplate;
    $scope.reportPopoverContent = ReportsItemsService.reportPopoverContent;

    $scope.$on('reportsItemsFetched', function () {
      $scope.$parent.total = ReportsItemsService.total;
      $scope.$parent.loading = false;
    });

    $scope.$on('loadFilters', function (event, reloading) {
      // reset pagination
      ReportsItemsService.resetCache();
      page = 1;
      $scope.$parent.loadingPagination = false;

      if (reloading) {
        $scope.$parent.reloading = true;
      }

      $scope.$parent.loadingContent = true;

      getData().then(function (reports) {
        $scope.$parent.loadingContent = false;
        $scope.reports = reports;

        if (reloading) {
          $scope.$parent.reloading = false;
        }
      });
    });

    $scope.$on('$destroy', function () {
      $log.debug('ReportsIndexListController destroyed.');
    });
  });
