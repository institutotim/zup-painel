angular
  .module('IndexControllerModule', [])

  .controller('IndexController', function(User, $state, $rootScope, $scope, $log) {

    $log.debug('IndexController created.');

    if (User)
    {
      if ($rootScope.hasAnyPermission(['inventories_full_access', 'inventories_categories_edit', 'inventories_items_create', 'inventories_items_edit', 'inventories_items_delete', 'inventories_items_read_only']))
      {
        $state.go('items.list');
      }
      else
      {
        $state.go('reports.index.list');
      }
    }
    else
    {
      $state.go('user.login');
    }

    $scope.$on('$destroy', function() {
      $log.debug('IndexController destroyed.');
    });

  });
