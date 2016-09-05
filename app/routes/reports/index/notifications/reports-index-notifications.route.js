angular
  .module('ReportsIndexNotificationsModule', [
    'ReportsIndexNotificationsControllerModule'
  ])

  .config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('reports.index.notifications', {
      url: '/notifications',

      views: {
        '': {
          templateUrl: 'routes/reports/index/notifications/reports-index-notifications.template.html',
          controller: 'ReportsIndexNotificationsController',
          controllerAs: 'ctrlReportsNotifications'
        }
      }
    });

  }]);
