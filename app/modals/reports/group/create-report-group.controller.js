(function (angular, _) {
  'use strict';

  angular
    .module('CreateReportsGroupModalControllerModule', ['ReportsItemsServiceModule'])
    .controller('CreateReportsGroupModalController', CreateReportsGroupModalController)
    .factory('CreateReportsGroupModalService', CreateReportsGroupModalService);

  CreateReportsGroupModalController.$inject = [
    '$scope',
    '$modalInstance',
    'ReportsItemsService',
    'reports',
    'suggestion'
  ];
  function CreateReportsGroupModalController($scope, $modalInstance, ReportsItemsService, reports, suggestion) {
    $scope.close = $modalInstance.close;
    $scope.reports = _.toArray(reports || suggestion.reports);
    $scope.getReportPopoverTemplate = ReportsItemsService.getReportPopoverTemplate;
    $scope.reportPopoverContent = ReportsItemsService.reportPopoverContent;
    $scope.isActive = isActive;
    $scope.toggleSelection = toggleSelection;
    $scope.isAbleToSave = isAbleToSave;
    $scope.save = save;

    var selectedReports = $scope.reports;

    function isAbleToSave() {
      return selectedReports.length > 1;
    }

    function isActive(report) {
      return selectedReports.indexOf(report) !== -1;
    }

    function toggleSelection(report) {
      if (isActive(report)) {
        selectedReports = _.without(selectedReports, report);
      } else {
        selectedReports.push(report);
      }
    }

    function save() {
      if (suggestion) {
        if (suggestion.reports_items_ids.length !== selectedReports.length) { // Suggestion was changed
          ReportsItemsService.updateSuggestion(suggestion, 'ignore');
        } else {
          ReportsItemsService.updateSuggestion(suggestion, 'group');
          return $modalInstance.close();
        }
      }

      var groupSelection = _.map(selectedReports, function (r) { return r.id });
      ReportsItemsService.groupReports(groupSelection.join());

      $modalInstance.close();
    }
  }

  CreateReportsGroupModalService.$inject = ['$modal'];
  function CreateReportsGroupModalService($modal) {
    var self = {};

    self.open = open;

    function open(suggestion, reports) {
      return $modal.open({
        templateUrl: 'modals/reports/group/create-report-group.template.html',
        windowClass: 'filterGroupsModal',
        controller: 'CreateReportsGroupModalController',
        resolve: {
          suggestion: function () {
            return suggestion;
          },
          reports: function () {
            return reports;
          }
        }
      }).result;
    }

    return self;
  }
})(angular, _);
