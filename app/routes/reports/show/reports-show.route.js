angular
  .module('ReportsShowModule', [
    'ReportsShowControllerModule',
    'ReportsShowPrintModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('reports.show', {
      url: '/{id:[0-9]+}',
      resolve: {
        'reportResponse': ['Restangular', '$stateParams', 'ReturnFieldsService', function(Restangular, $stateParams, ReturnFieldsService) {
          var returnFields = [
            "id", "protocol", "address", "number", "district", "country", "postal_code", "state",
            "city", "created_at", "description", "comment_required_when_updating_status", "feedback", "images",
            "inventory_item", "inventory_item_category_id", "overdue", "position", "reference", "status",
            "custom_fields", "perimeter", "offensive_flags", "grouped",
            {
              "notifications": [
                "created_at", "days_to_deadline", "content", "active",
                {
                  "notification_type": ["title", "default_deadline_in_days"]
                }
              ],
              "category": [
                "custom_fields", "id", "marker", "notifications", "icon",
                "priority_pretty", "comment_required_when_updating_status", "comment_required_when_forwarding",
                "solver_groups_ids", "statuses", "title",
                {
                  "solver_groups": ["id", "name"],
                  "default_solver_group": ["name", "id"]
                }
              ],
              "user": ["name", "email", "id", "phone"],
              "assigned_user": ["id", "name"],
              "assigned_group": ["id", "name"],
              'related_entities': [{
                'inventory_items': [
                  'id', 'title', 'sequence', 'created_at', 'updated_at',
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

          return Restangular.one('reports').one('items', $stateParams.id).get({ 'return_fields': ReturnFieldsService.convertToString(returnFields) });
        }]
      },
      views: {
        '': {
          templateUrl: 'routes/reports/show/reports-show.template.html',
          controller: 'ReportsShowController',
          controllerAs: 'ctrl'
        }
      }
    });
  }]);
