angular
  .module('ReportsAddModule', [
    'ReportsAddControllerModule'
  ])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('reports.add', {
      url: '/add',
      views: {
        '': {
          templateUrl: 'routes/reports/add/reports-add.template.html',
          controller: 'ReportsAddController',
          controllerAs: 'ctrl',
          resolve: {
            'inventoriesCategoriesResponse': ['Restangular', '$stateParams', function (Restangular, $stateParams) {
              return Restangular.all('inventory').all('categories').getList({
                'display_type': 'full',
                'return_fields': ['id', 'title', 'pin', 'marker'].join()
              })
            }],

            'reportCategoriesResponse': ['Restangular', '$stateParams', function (Restangular, $stateParams) {
              return Restangular.all('reports').all('categories').getList({
                'display_type': 'full',
                'return_fields': ['id', 'title', 'pin', 'marker', 'inventory_categories', 'subcategories.id',
                  'subcategories.title', 'subcategories.inventory_categories', 'subcategories.pin', 'custom_fields',
                  'subcategories.marker'].join()
              });
            }]
          }
        }
      }
    });
  }]);
