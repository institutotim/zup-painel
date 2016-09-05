(function (angular) {
  'use strict';

  angular
    .module('BusinessReportsEditChartsDirectiveModule', ['BusinessReportsEditChartDirectiveModule'])
    .directive('businessReportsCharts', businessReportsCharts);

  businessReportsCharts.$inject = [];
  function businessReportsCharts() {
    return {
      restrict: 'E',
      scope: {
        charts: '=', // angular 1.26 does not support optional binding, so this is required
        valid: '=',
        editable: '='
      },
      templateUrl: 'routes/business-reports/edit/components/charts/business-reports-edit-charts.template.html',
      controller: businessReportsChartsController
    }
  }

  businessReportsChartsController.$inject = [
    '$scope',
    '$log'
  ];
  function businessReportsChartsController($scope, $log) {
    $log.info('businessReportsChartsController created.');

    $scope.$on('$destroy', function () {
      $log.info('businessReportsChartsController destroyed.');
    });

    $scope.addChart = _addChart;
    $scope.updatedChart = _updatedChart;
    $scope.deleteChart = _deleteChart;
    $scope.isActive = _isActive;

    var indexTracker = 0;

    function _addChart() {
      var chart = { index: indexTracker++ };
      $scope.charts[chart.index] = chart;
    }

    // Updates validation when view is selected
    function _updatedChart(index) {
      var chart = _.findWhere($scope.charts, {index: index});
      if (chart.updated > 0) {
        return chart.updated++;
      }
      chart.updated = 1;
    }

    function _deleteChart(index) {
      $scope.charts[index].deleted = true;
    }

    function _isActive(chart) {
      return !chart.deleted;
    }

    function _initialize() {
      if ($scope.charts.length < 1) {
        $scope.addChart();
      }

      _.each($scope.charts, function (chart) {
        if (!_.isUndefined(chart) && (chart.index > indexTracker)) indexTracker = chart.index;
      });

      indexTracker += 1;
    }

    _initialize();
  }

})(angular);
