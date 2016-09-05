'use strict';

/**
 * Provides an API client for the namespaces API
 * @module NamespacesServiceModule
 */
angular
  .module('NamespacesServiceModule', [])
  .factory('NamespacesService', function ($q, Restangular) {
    /**
     * Fetches all namespaces
     * @returns {Object} promise
     */
    self.fetchAll = function () {
      var url = Restangular.all('namespaces').withHttpConfig({treatingErrors: true});

      var promise = url.customGET();

      var deferred = $q.defer();

      promise.then(function (response) {
        var namespaces = Restangular.stripRestangular(response.data);

        deferred.resolve(namespaces);
      }, function (response) {
        deferred.reject(response);
      });

      return deferred.promise;
    };

    /**
     * Removes a single namespace
     * @param {Number} id The namespace ID
     * @returns {Object} promise
     */
    self.remove = function (id) {
      var promise = Restangular.one('namespaces', id).withHttpConfig({treatingErrors: true}).remove(),
          deferred = $q.defer();

      promise.then(function (response) {
        deferred.resolve(response);
      }, function (response) {
        deferred.reject(response);
      });

      return deferred.promise;
    };

    /**
     * Saves or creates a single namespace
     * @param {Object} namespace The namespace object of shape { name: String, id: (optional)int }
     * @returns {Object} promise
     */
    self.save = function (namespace) {
      var deferred = $q.defer();

      var namespaceSavePromise;

      if (namespace.id) {
        namespaceSavePromise = Restangular.one('namespaces', namespace.id).withHttpConfig({treatingErrors: true}).customPUT(namespace);
        namespaceSavePromise.then(function (response) {
          deferred.resolve(response.data);
        }, function (response) {
          deferred.reject(response);
        });
      } else {
        namespaceSavePromise = Restangular.one('namespaces').withHttpConfig({treatingErrors: true}).customPOST(namespace);
        namespaceSavePromise.then(function (response) {
          deferred.resolve(response.data);
        }, function (response) {
          deferred.reject(response);
        })
      }

      return deferred.promise;
    };

    return self;
  });
