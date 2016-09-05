'use strict';

angular
  .module('ReportsShowPrintControllerModule', [
    'MapShowReportComponentModule'
  ])

  .controller('ReportsShowPrintController', function ($scope, $window, $timeout, $document, $stateParams, reportResponse, feedbackResponse, commentsResponse, reportHistoryResponse) {
    $scope.report = reportResponse.data;
    $scope.report.status_id = $scope.report.status.id;
    $scope.feedback = feedbackResponse.data;
    $scope.comments = commentsResponse.data;

    var sections = $stateParams.sections.split(',');

    $scope.showSection = function (section) {
      return sections.indexOf(section) !== -1;
    };

    $scope.showAnySection = function (sections) {
      return _.reduce(sections, function (memo, section) {
        return memo || $scope.showSection(section);
      });
    };

    $scope.filterByUserMessages = function (comment) {
      return (comment.visibility === 0 || comment.visibility === 1);
    };

    $scope.historyLogs = reportHistoryResponse.data;

    $scope.print = function () {
      $window.print();
    };
  });
