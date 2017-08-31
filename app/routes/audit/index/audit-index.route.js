(function (angular) {
  angular
    .module('AuditIndexModule', [
      'AuditIndexControllerModule'
    ])
    .config(['$stateProvider', function ($stateProvider) {

      $stateProvider.state('audit.list', {
        url: '',
        views: {
          '': {
            templateUrl: 'routes/audit/index/audit-index.template.html',
            controller: 'AuditIndexController',
            controllerAs: 'ctrl',
            resolve: {
              'Authorize': ['$rootScope', '$state', function ($rootScope, $state) {
                if (!$rootScope.hasAnyPermission(['event_logs_view'])) {
                  $rootScope.showMessage('exclamation-sign', 'Você não possui permissão para visualizar essa página.', 'error');

                  $state.go('items.list');
                }
              }]
            }
          }
        }
      });
    }]);

})(angular);
