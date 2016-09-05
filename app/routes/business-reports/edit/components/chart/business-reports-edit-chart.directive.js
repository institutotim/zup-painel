(function ($, angular, _) {
  'use strict';

  angular
    .module('BusinessReportsEditChartDirectiveModule', [
      'googlechart',
      'BusinessReportsEditChartModalModule'
    ])
    .directive('businessReportsChart', businessReportsChart);

  businessReportsChart.$inject = [];
  function businessReportsChart() {
    return {
      restrict: 'E',
      scope: {
        editable: '=',
        onChartUpdate: '&',
        onChartDelete: '&',
        index: '=',
        chart: '='
      },
      templateUrl: 'routes/business-reports/edit/components/chart/business-reports-edit-chart.template.html',
      controllerAs: 'chartCtrl',
      controller: businessReportsChartController
    }
  }

  businessReportsChartController.$inject = [
    '$scope',
    '$controller',
    '$timeout',
    'cubesService'
  ];
  function businessReportsChartController($scope, $controller, $timeout, cubesService) {
    $controller('CubesViewerStudioController', {$scope: $scope, $element: undefined});

    $scope.size = _.size;
    $scope.isCubeSelected = _isCubeSelected;
    $scope.isEditable = _isEditable;
    $scope.getView = _getView;
    $scope.removeView = _removeView;

    function _isCubeSelected() {
      return !!$scope.studioViewsService.views[$scope.index];
    }

    function _isEditable() {
      return !!$scope.editable;
    }

    function _getView() {
      return $scope.studioViewsService.views[$scope.index];
    }

    function _removeView() {
      $scope.studioViewsService.closeView(_getView());
      $scope.onChartDelete($scope.index);
    }

    function _initialize() {
      if (!cubesService.isConnected()) {
        return $timeout(_initialize, 500);
      }

      if ($scope.chart.params) {
        $scope.studioViewsService.addViewObject($scope.chart.params, $scope.index);
      }
    }

    $scope.onChartTemplateLoaded = function () {
      $('.cv-views-container').masonry({
        itemSelector: '.cv-view-container',
        columnWidth: '.cv-views-gridsizer',
        percentPosition: true,
        containerStyle: {position: 'relative'}
      });
    };

    var chartChanged = function () {
      $scope.onChartUpdate($scope.index);
    };

    $scope.$on('ViewRefresh', chartChanged);
    $scope.$on('ViewModeChanged', chartChanged);

    _initialize();
  }

})($, angular, _);
