angular
    .module('ItemsEditModule', [
      'ItemsEditControllerModule'
    ])

    .config(['$stateProvider', function($stateProvider) {

      $stateProvider.state('items.show.edit', {
        url: '/category/{categoryId:[0-9]{1,9}}/edit',
        views: {
          '@': {
            templateUrl: 'routes/items/edit/items-edit.template.html',
            controller: 'ItemsEditController',
            controllerAs: 'ctrl',
            resolve: {
              'categoryResponse': ['Restangular', '$stateParams', 'ReturnFieldsService', function(Restangular, $stateParams, ReturnFieldsService) {
                var returnFields = [
                  "id", "marker", "pin", "plot_format", "require_item_status", "statuses", "title", "updated_at",
                  {
                    "sections": [
                      "id", "title", "disabled", "required", "location", "position",
                      {
                        "fields": [
                          "id", "disabled", "title", "kind", "label", "available_values", "field_options",
                          "position", "maximum", "minimum", "required"
                        ]
                      }
                    ]
                  }
                ];

                return Restangular.one('inventory').one('categories', $stateParams.categoryId).get({'display_type': 'full', 'return_fields': ReturnFieldsService.convertToString(returnFields)});
              }],
              'itemResponse': ['Restangular', '$stateParams', 'ReturnFieldsService', function(Restangular, $stateParams, ReturnFieldsService) {
                var returnFields = [
                  'id', 'title', 'address', 'inventory_status_id', 'status',
                  'locked', 'locker_id', 'locked_at', 'position',
                  'inventory_category_id', 'data', 'created_at', 'updated_at'
                ];

                return Restangular.one('inventory').one('items', $stateParams.id).get({'display_type': 'full', 'return_fields': ReturnFieldsService.convertToString(returnFields)});
              }]
            }
          }
        }
      }).state('items.add', {
        url: '/category/{categoryId:[0-9]{1,9}}/add',
        views: {
          '@': {
            templateUrl: 'routes/items/edit/items-edit.template.html',
            controller: 'ItemsEditController',
            controllerAs: 'ctrl',
            resolve: {
              'categoryResponse': ['Restangular', '$stateParams', 'ReturnFieldsService', function(Restangular, $stateParams, ReturnFieldsService) {
                var returnFields = [
                  "id", "marker", "pin", "plot_format", "require_item_status", "statuses", "title",
                  {
                    "sections": [
                      "id", "title", "disabled", "required", "location", "position",
                      {
                        "fields": [
                          "id", "disabled", "title", "kind", "label", "available_values", "field_options",
                          "position", "maximum", "minimum", "required"
                        ]
                      }
                    ]
                  }
                ];

                return Restangular.one('inventory').one('categories', $stateParams.categoryId).get({'display_type': 'full', 'return_fields': ReturnFieldsService.convertToString(returnFields)});
              }],

              'itemResponse': function() {
                return false;
              }
            }
          }
        }
      });
    }]);
