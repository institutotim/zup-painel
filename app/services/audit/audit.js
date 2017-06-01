(function (angular, _) {
  'use strict';

  /**
   * Provides an API client for the auditions on the ZUP API
   * @module AuditService
   */
  angular
    .module('AuditServiceModule', ['UsersServiceModule'])
    .factory('AuditService', AuditService);

  AuditService.$inject = [
    '$q',
    'FullResponseRestangular',
    'ReturnFieldsService',
    'UsersService',
    '$log'
  ];
  function AuditService($q, FullResponseRestangular, ReturnFieldsService, UsersService, $log) {
    var service = {};

    service.total = 0;
    service.auditions = [];

    var DEFAULT_FIELDS = [
      'id', 'request_method', 'url', 'headers', 'request_body', 'created_at', 'updated_at', 'user'
    ];

    /**
     *
     */
    service.cleanCache = function () {
      $log.debug('Cleaning auditions cache.');
      service.total = 0;
      service.auditions = {};
    };

    /**
     * Fetches all auditions
     * @param {Array} options - extra options for the endpoint
     *
     * @returns {deferred.promise|{then}|{then, catch, finally}}
     */
    service.fetchAll = function (options) {
      var deferred = $q.defer(),
        defaults = {};

      defaults.display_type = 'full';
      defaults.return_fields = ReturnFieldsService.convertToString([
        'id', 'request_method', 'url', 'headers', 'request_body', 'created_at', 'updated_at', 'user.name', 'user.id'
      ]);

      options = angular.extend(defaults, options || {});

      var promise = FullResponseRestangular.all('event_logs').customGET(null, options);

      promise.then(function (response) {
        service.auditions = response.data.event_logs;
        service.total = parseInt(response.headers().total, 10);

        deferred.resolve(service.auditions);
      });

      promise.catch(deferred.reject);

      return deferred.promise;
    };

    return service;
  }

})(angular, _);
