(function (angular) {
  'use strict';

  angular
    .module('ExportsModule', [
      'ExportsIndexModule'
    ])
    .config(ExportsRouter);

  ExportsRouter.$inject = ['$stateProvider'];
  function ExportsRouter($stateProvider) {
    $stateProvider.state('exports', {
      abstract: true,
      url: '/exports',
      templateUrl: 'routes/exports/exports.template.html',
      resolve: {
        'User': ['User', function(User) {
          return User({ permissions: ['isLogged'] });
        }],
        'Authorize': ['$rootScope', '$state', 'User', function ($rootScope, $state, User) {
          var permissions = [
            'reports_full_access', 'inventories_full_acess',
            'reports_items_export', 'inventories_items_export'
          ];

          if (!$rootScope.hasAnyPermission(permissions)) {
            $rootScope.showMessage(
              'exclamation-sign',
              'Você não possui permissão para visualizar essa página.',
              'error'
            );

            $state.go('items.list');
          }
        }]
      }
    });
  }
})(angular);
