angular
  .module('BusinessReportsEditModule', [
    'BusinessReportsEditControllerModule',
    'BusinessReportsServiceModule'
  ])

  .config(['$stateProvider', function ($stateProvider) {

    $stateProvider.state('business_reports.edit', {
      url: '/{reportId:[0-9]{1,9}}/edit',
      views: {
        '': {
          templateUrl: 'routes/business-reports/edit/business-reports-edit.template.html',
          controller: 'BusinessReportsEditController'
        }
      },
      resolve: {
        'editable': ['$q', function ($q) {
          var deferred = $q.defer();
          deferred.resolve(true);
          return deferred.promise;
        }]
      }
    });

    $stateProvider.state('business_reports.show', {
      url: '/{reportId:[0-9]{1,9}}/show',
      views: {
        '': {
          templateUrl: 'routes/business-reports/edit/business-reports-edit.template.html',
          controller: 'BusinessReportsEditController'
        }
      },
      resolve: {
        'editable': ['$q', function ($q) {
          var deferred = $q.defer();
          deferred.resolve(false);
          return deferred.promise;
        }]
      }
    });

    $stateProvider.state('business_reports.add', {
      url: '/add',
      views: {
        '': {
          templateUrl: 'routes/business-reports/edit/business-reports-edit.template.html',
          controller: 'BusinessReportsEditController'
        }
      },
      resolve: {
        'editable': ['$q', function ($q) {
          var deferred = $q.defer();
          deferred.resolve(true);
          return deferred.promise;
        }]
      }
    });

  }]);
