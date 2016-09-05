angular
  .module('GroupsIndexModule', [
    'GroupsIndexControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('groups.list', {
      url: '',
      views: {
        '': {
          templateUrl: 'routes/groups/index/groups-index.template.html',
          controller: 'GroupsIndexController',
          controllerAs: 'ctrl',
          resolve: {
            'Authorize': ['$rootScope', '$state', function($rootScope, $state) {
              if (!$rootScope.hasAnyPermission(['groups_full_access', 'group_edit', 'group_read_only'])) {
                $rootScope.showMessage(
                  'exclamation-sign',
                  'Você não possui permissão para visualizar essa página.',
                  'error'
                );

                $state.go('items.list');
              }
            }]
          }
        }
      }
    });
  }]);
