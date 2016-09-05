angular
  .module('ReportsCategoriesEditModule', [
    'ReportsCategoriesEditControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('reports.categories.edit', {
      url: '/{id:[0-9]{1,4}}/edit',

      views: {
        '@reports': {
          templateUrl: 'routes/reports/categories/edit/reports-categories-edit.template.html',
          controller: 'ReportsCategoriesEditController',
          controllerAs: 'ctrl',
          resolve: {
            'reportCategoriesResponse': ['Restangular', function(Restangular) {
              return Restangular.all('reports').all('categories').getList({ 'display_type': 'full', return_fields: 'id,title' });
            }],

            'groupsResponse': ['Restangular', function(Restangular) {
              return Restangular.all('groups').getList({ return_fields: 'id,name'});
            }],

            'notificationsTypesResponse': ['Restangular', '$stateParams', function(Restangular, $stateParams) {
              return Restangular.one('reports')
                .one('categories', $stateParams.id)
                .all('notification_types')
                .getList({return_fields: 'id,category.id,status.id,order,title,default_deadline_in_days,layout,active,created_at,updated_at'});
            }]
          }
        }
      }
    }).state('reports.categories.add', {
      url: '/add',

      views: {
        '@reports': {
          templateUrl: 'routes/reports/categories/edit/reports-categories-edit.template.html',
          controller: 'ReportsCategoriesEditController',
          controllerAs: 'ctrl',
          resolve: {
            'reportCategoriesResponse': ['Restangular', function(Restangular) {
              return Restangular.all('reports').all('categories').getList({ return_fields: 'id,title'});
            }],

            'groupsResponse': ['Restangular', function(Restangular) {
              return Restangular.all('groups').getList({ return_fields: 'id,name'});
            }],

            'notificationsTypesResponse': [function() {
              return {};
            }]
          }
        }
      }
    });
  }]);
