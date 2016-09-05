(function (angular, _) {
  'use strict';

  angular
    .module('BusinessReportsEditControllerModule', [
      'BusinessReportsEditHeaderDirectiveModule',
      'BusinessReportsEditFormDirectiveModule',
      'BusinessReportsEditChartsDirectiveModule',
      'BusinessReportsServiceModule',
      'AngularPrint'
    ])
    .controller('BusinessReportsEditController', BusinessReportsEditController);

  BusinessReportsEditController.$inject = [
    '$state',
    '$scope',
    '$stateParams',
    '$timeout',
    '$window',
    'BusinessReportsService',
    'editable'
  ];
  function BusinessReportsEditController($state, $scope, $stateParams, $timeout, $window, BusinessReportsService, editable) {
    $scope.reportLoaded = false;
    $scope.editable = editable;
    $scope.saveBusinessReport = _saveBusinessReport;

    // Enable/disable save button
    function _updateValidity() {
      $scope.valid = $scope.reportLoaded && BusinessReportsService.isValid($scope.report);
    }

    $scope.$watch('report.title', _updateValidity);
    $scope.$watch('report.summary', _updateValidity);
    $scope.$watch('report.charts', _updateValidity, true);

    // Save
    function _saveBusinessReport() {
      $scope.savePromise = BusinessReportsService.save(angular.copy($scope.report));
      $scope.savePromise.then(function (report) {
        $scope.report = report;
        $scope.showMessage('ok', 'O Relatório ' + $scope.report.title + ' foi salvo com sucesso', 'success', true);
        $state.go('business_reports.show', {reportId: $scope.report.id});
      }, function () {
        $scope.showMessage('exclamation-sign', ' Não foi possível salvar o relatório ' + $scope.report.title + '. Por favor, tente novamente em alguns minutos.', 'error', true);
      });
    }

    function _initialize() {
      BusinessReportsService.clearViews();

      // Load report
      if ($stateParams.reportId) {
        BusinessReportsService.find($stateParams.reportId).then(function (report) {
          $scope.report = report;
          $scope.reportLoaded = true;
        }, function () {
          $scope.showMessage('exclamation-sign', ' Não foi possível carregar o relatório requisitado. Por favor, tente novamente em alguns minutos.', 'error', true);
          $state.go('business_reports.list');
        });
      } else {
        $scope.report = {charts: []};
        $scope.reportLoaded = true;
      }

      $window.MasonryHack = { position: 'relative' };
    }

    $timeout(_initialize, 500);
  }

})(angular, _);
