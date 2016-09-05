'use strict';

/**
 * Provides an API client for the services from ZUP API
 * @module ServicesServiceModule
 */
angular
  .module('ServicesServiceModule', [])
  .factory('ServicesService', function ($q, FullResponseRestangular) {
    var self = {};

    /**
     * Fetch all services
     * @param {Object} options
     */
    self.fetchAll = function (options) {
      var defaults = {};

      defaults.display_type = 'full';

      options = angular.extend(defaults, options || {});

      return FullResponseRestangular
        .all('services')
        .withHttpConfig({treatingErrors: true})
        .customGET(null, options)
        .then(function (response) {
          return response.data.services;
        });
    };

    /**
     * Fetch a single service
     * @param {Integer} id - Service's id
     * @param {Object} options - Extra options
     */
    self.fetch = function (id, options) {
      var defaults = {};

      defaults.display_type = 'full';

      options = angular.extend(defaults, options || {});

      return FullResponseRestangular
        .one('services', id)
        .withHttpConfig({treatingErrors: true})
        .customGET(null, options)
        .then(function (response) {
          return response.data.service;
        });
    };

    /**
     * Create service
     * @param {Object} service
     * @param {Object} options - Extra options
     */
    self.create = function (service, options) {
      var defaults = {};
      options = angular.extend(defaults, options || {});

      return FullResponseRestangular
        .one('services')
        .withHttpConfig({treatingErrors: true})
        .post(null, service, options)
        .then(function (response) {
          return response.data.service;
        })
        .catch(function (response) {
          return $q.reject(response.data.error);
        });
    };

    /**
     * Update service
     * @param {Object} service
     * @param {Object} options - Extra options
     */
    self.update = function (service, options) {
      var defaults = {};
      options = angular.extend(defaults, options || {});

      return FullResponseRestangular
        .one('services', service.id)
        .withHttpConfig({treatingErrors: true})
        .customPUT(service, null, options)
        .catch(function (response) {
          return $q.reject(response.data.error);
        });
    };

    return self;
  });
