(function (angular) {
  'use strict';

  angular
    .module('AuditModule', ['AuditIndexModule'])
    .config(['$stateProvider', function ($stateProvider) {

      $stateProvider.state('audit', {
        abstract: true,
        url: '/audit',
        templateUrl: 'routes/audit/audit.template.html',
        resolve: {
          'User': ['User', function (User) {
            return User({permissions: ['isLogged', '']});
          }]
        }
      });

    }]);

})(angular);
