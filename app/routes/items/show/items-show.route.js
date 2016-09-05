angular
  .module('ItemsShowModule', [
    'ItemsShowControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('items.show', {
      url: '/{id:[0-9]{1,9}}',
      views: {
        '': {
          templateUrl: 'routes/items/show/items-show.template.html',
          controller: 'ItemsShowController',
          controllerAs: 'ctrl',
          resolve: {
            'itemResponse': ['$q', 'Restangular', '$stateParams', 'ReturnFieldsService', function($q, Restangular, $stateParams, ReturnFieldsService) {

              var deferred = $q.defer();

              var itemsReturnFields = [
                'id', 'address', 'inventory_category_id', 'inventory_category_id',
                'inventory_status_id', 'position', 'title', {
                  'data': [
                    'id', 'content', 'selected_options',
                    {
                      field: ['id']
                    }
                  ],
                  'related_entities': [{
                    'report_items': [
                      'id', 'created_at', 'updated_at',
                      {
                        'category': ['title'],
                        'status': ['title']
                      }
                    ],
                    'cases': [
                      'id', 'created_at', 'updated_at', 'status',
                      {
                        'initial_flow': ['title']
                      }
                    ]
                  }]
                }
              ];

              var categoryReturnFields = [
                'id', 'title', 'marker', 'pin', 'statuses', 'plot_format',
                'sections.id', 'sections.title', 'sections.disabled', 'sections.position',
                'sections.fields.title', 'sections.fields.label', 'sections.fields.kind', 'sections.fields.id', 'sections.fields.position', 'sections.fields.disabled'
              ];

              var item = Restangular.one('inventory').one('items', $stateParams.id).get({ 'return_fields': ReturnFieldsService.convertToString(itemsReturnFields), 'display_type': 'full' });

              item.then(function(itemResponse) {
                var item = angular.copy(itemResponse.data);
                var category = Restangular.one('inventory').one('categories', item.inventory_category_id).get({ return_fields: categoryReturnFields.join(), display_type: 'full' });

                category.then(function(categoryResponse) {

                  item.category = angular.copy(categoryResponse.data);

                  deferred.resolve(item);
                });
              });

              return deferred.promise;
            }]
          }
        }
      }
    });
  }]);
