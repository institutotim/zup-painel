'use strict';

angular
  .module('ReportsSelectModalModule', [
    'ItemSelectorDirectiveModule',
    'ReportsItemsServiceModule',
    'ConfigServiceModule'
  ])
  .controller('ReportsSelectModalController', function ($scope, $q, ReportsItemsService, ConfigService, $modalInstance, insertedReports, permittedCategories, multiple, lrInfiniteScroll) {
    var page = 1, per_page = 35;

    function initialize() {
      $scope.reports = [];
      $scope.insertedReports = angular.copy(insertedReports);

      $scope.loadingPagination = true;
      getColumns().then(function () {
        $scope.getReports();
      });
    }

    $scope.getReports = function () {
      var fetchOptions = {
        page: page,
        per_page: per_page,
        reports_categories_ids: permittedCategories.join(),
        return_fields: getReturnFieldsForColumns($scope.activeColumns)
      };

      $scope.loadingPagination = true;
      return (
        ReportsItemsService
          .fetchAll(fetchOptions)
          .then(function (reports) {
            $scope.reports = _.toArray(reports);
            page++;
            $scope.loadingPagination = false;
          })
      );
    };

    $scope.close = function () {
      $modalInstance.dismiss();
    };

    $scope.confirm = function () {
      $modalInstance.close($scope.insertedReports);
    };

    $scope.insertReport = function (report) {
      if (multiple) {
        $scope.insertedReports.push(report.id);
      } else {
        $scope.insertedReports[0] = report.id;
      }
    };

    $scope.removeReport = function (report) {
      $scope.insertedReports.splice($scope.insertedReports.indexOf(report.id), 1);
    };

    $scope.isInsertedReport = function (report) {
      return _.contains($scope.insertedReports, report.id);
    }

    function getColumns() {
      return ConfigService.getReportsColumns().then(function (reportsColumns) {
        $scope.activeColumns = _.filter(reportsColumns, function (c) {
          return c.active;
        });
      });
    }

    function getReturnFieldsForColumns(columns) {
      var defaultFields = ['id', 'status_id', 'category_id', 'overdue'];

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

    initialize();
  })
  .factory('ReportsSelectModalService', function ($modal) {
    return {
      open: function (reports, categories, multiple) {
        return (
          $modal.open({
            templateUrl: 'modals/reports/select/reports-select.template.html',
            windowClass: 'reportsSelectModal',
            resolve: {
              insertedReports: function () {
                return reports;
              },
              permittedCategories: function () {
                return categories;
              },
              multiple: function () {
                return multiple;
              }
            },
            controller: 'ReportsSelectModalController',
            controllerAs: 'reportsSelectModalCtrl'
          }).result
        );
      }
    }
  });
