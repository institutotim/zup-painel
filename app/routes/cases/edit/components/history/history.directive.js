'use strict';

angular
  .module('CaseHistoryDirectiveModule', ['CasesServiceModule'])
  .directive('caseHistory', function (CasesService) {
    return {
      restrict: 'E',
      scope: {
        id: '='
      },
      templateUrl: 'routes/cases/edit/components/history/history.template.html',
      controller: function ($scope) {
        CasesService.fetchHistory($scope.id).then(function (response) {
          $scope.log = {};
          _.each(response.data.cases_log_entries, function (entry) {
            var createdAt = moment(entry.created_at);
            var date = createdAt.format("DD") + " de " + createdAt.format("MMMM") + " de " + createdAt.format("YYYY");
            entry.hour = createdAt.format("HH") + "h " + createdAt.format("mm") + "min";
            if ($scope.log[date]) {
              $scope.log[date].push(entry);
            } else {
              $scope.log[date] = [entry];
            }
          });
        });
      }
    };
  });
