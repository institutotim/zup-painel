'use strict';

angular
  .module('BusinessReportsEditChartModalModule', ['ItemSelectorDirectiveModule'])
  .controller('BusinessReportsEditChartModalController', function ($modal, $scope, ReportsCategoriesService, $modalInstance, promise, chart) {
    $scope.chartTypes = [
      {type: 'BarChart', title: 'Barra'},
      {type: 'PieChart', title: 'Pizza'},
      {type: 'AreaChart', title: 'Área'},
      {type: 'LineChart', title: 'Linha'}
    ];

    $scope.metricTypes = [
      {metric: "total-reports-by-category", title: "Total de relatos criados por categoria"},
      {metric: "total-reports-by-status", title: "Total de relatos por estado"},
      {metric: "total-reports-overdue-by-category", title: "Total de relatos atrasados por categoria"},
      {metric: "total-reports-overdue-by-category-per-day", title: "Total de relatos atrasados por quantidade de dias em atraso"},
      {metric: "total-reports-assigned-by-category", title: "Total de relatos delegados por categoria"},
      {metric: "total-reports-assigned-by-group", title: "Total de relatos que foram associados, por grupo"},
      {metric: "total-reports-unassigned-to-user", title: "Total de relatos que não foram delegados à nenhum usuário"},
      {metric: "average-resolution-time-by-category", title: "Média de tempo de resolução por categoria"},
      {metric: "average-resolution-time-by-group", title: "Média de tempo de resolução por grupo associado"},
      {metric: "average-overdue-time-by-category", title: "Média de atraso por categoria"},
      {metric: "average-overdue-time-by-group", title: "Média de tempo de atraso por grupo"}
    ];

    $scope.getReportCategories = ReportsCategoriesService.fetchTitlesAndIds;
    $scope.chart = chart;

    $scope.select2Options = {
      minimumResultsForSearch: Infinity
    };

    $scope.valid = function () {
      return $scope.chart.categories.length > 0 &&
        $scope.chart.metric &&
        $scope.chart.type;
    };

    $scope.close = function () {
      promise.reject();
      $modalInstance.close();
    };

    $scope.confirm = function () {
      promise.resolve($scope.chart);
      $modalInstance.close();
    };

    $scope.chart.categories = $scope.chart.categories || [];
    $scope.selectCategory = function (item) {
      var hasCategory = _.findWhere($scope.chart.categories, { id: item.id});

      if (!hasCategory) {
        $scope.chart.categories.push(item);
      }
    };

    $scope.removeCategory = function (category) {
      $scope.chart.categories.splice($scope.chart.categories.indexOf(category), 1);
    };
  })
  .factory('BusinessReportsEditChartModalService', function ($modal, $q) {
    return {
      open: function (chart) {
        var deferred = $q.defer();

        $modal.open({
          templateUrl: 'modals/business-reports/edit-chart/business-reports-edit-chart.template.html',
          windowClass: 'businessReportEditChartModal',
          resolve: {
            promise: function () {
              return deferred;
            },

            chart: function () {
              return chart;
            }
          },
          controller: 'BusinessReportsEditChartModalController',
          controllerAs: 'businessReportEditCtrl'
        });

        return deferred.promise;
      }
    }
  });
