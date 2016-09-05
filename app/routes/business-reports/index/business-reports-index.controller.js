(function (angular) {
  'use strict';

  angular
    .module('BusinessReportsIndexControllerModule', [
      'BusinessReportsIndexHeaderDirectiveModule',
      'BusinessReportsIndexListDirectiveModule',
      'BusinessReportsServiceModule'
    ])
    .controller('BusinessReportsIndexController', BusinessReportsIndexController);

  BusinessReportsIndexController.$inject = [
    '$scope',
    '$log',
    'BusinessReportsService'
  ];
  function BusinessReportsIndexController($scope, $log, BusinessReportsService) {
    $log.info('BusinessReportsIndexController created.');

    $scope.$on('$destroy', function () {
      $log.info('BusinessReportsIndexController destroyed.');
    });

    $scope.loadContent = BusinessReportsService.fetchAll;
  }

})(angular);
