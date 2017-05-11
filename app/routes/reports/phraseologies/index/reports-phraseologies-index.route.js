(function (angular) {
  'use strict';

  angular
    .module('ReportsPhraseologiesIndexModule', [
      'ReportsPhraseologiesControllerModule'
    ])

    .config(['$stateProvider', function ($stateProvider) {

      $stateProvider.state('reports.phraseologies', {
        url: '/phraseologies',
        cache: false,
        views: {
          '': {
            templateUrl: 'routes/reports/phraseologies/index/reports-phraseologies-index.template.html',
            controller: 'ReportsPhraseologiesController',
            controllerAs: 'ctrl'
          }
        }
      });

    }]);

})(angular);
