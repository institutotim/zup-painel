(function (angular) {
  'use strict';

  angular
    .module('ExportsIndexModule', [
      'ExportsIndexControllerModule'
    ])
    .config(ExportsIndexRouter);

  ExportsIndexRouter.$inject = ['$stateProvider'];
  function ExportsIndexRouter($stateProvider) {
    $stateProvider.state('exports.list', {
      url: '',
      views: {
        '': {
          templateUrl: 'routes/exports/index/exports-index.template.html',
          controller: 'ExportsIndexController',
          controllerAs: 'vm'
        }
      }
    });
  }
})(angular);
