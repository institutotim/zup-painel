(function (angular) {
  'use strict';

  /**
   * Provides an API client for the reports phraseologies from ZUP API
   * @module ReportsPhraseologies
   * @author Rodrigo Gomes da Silva (rodrigo.smscom@gmail.com)
   */
  angular
    .module('ReportsPhraseologiesServiceModule', [])
    .factory('ReportsPhraseologiesService', function (Restangular, FullResponseRestangular, $rootScope, $q, $log) {

      var service = {};

      service.phraseologies = {};

      service.listAllReturnFields = [
        'id',
        'reports_category_id',
        'title',
        'description'
      ];

      service.cleanCache = function () {
        $log.debug('Cleaning phraseologies cache...');
        service.phraseologies = {};
      };

      /**
       * Retrieve all phraseologies
       *
       * @returns {*}
       */
      service.fetchAll = function (options) {
        $log.debug('Fetching phraseologies...');

        options = options || {};

        var defaults = {
          display_type: 'full',
          return_fields: service.listAllReturnFields.join()
        };

        angular.merge(defaults, options);

        var promise = FullResponseRestangular
          .all('reports')
          .all('phraseologies')
          .customGET(null, defaults);

        var deferred = $q.defer();

        promise.then(function (resp) {

          if (options.grouped) {
            service.phraseologies = resp.data.phraseologies;
          } else {
            _.each(resp.data.phraseologies, function (r) {
              service.phraseologies[r.id] = r;
            });
          }

          deferred.resolve(service.phraseologies);

          $rootScope.$broadcast('phraseologiesFetched');

        }, function () {
          deferred.reject('Erro na consulta');
        });

        return deferred.promise;
      };

      /**
       * Add a new phraseology
       *
       * @param phraseology
       * @returns {*}
       */
      service.addPhraseology = function (phraseology) {
        $log.debug('Adding new phraseology [reports_category_id: ' + phraseology.reports_category_id + ', title: ' + phraseology.title + ', description: ' + phraseology.description + ']');
        phraseology.return_fields = 'id';
        return Restangular
          .one('reports')
          .withHttpConfig({treatingErrors: true})
          .post('phraseologies', phraseology);
      };

      /**
       * Update an existing phraseology
       *
       * @param phraseology
       * @returns {*}
       */
      service.updatePhraseology = function (phraseology) {
        $log.debug('Update an existing phraseology [title: ' + phraseology.title + ', id: ' + phraseology.id + ']');
        phraseology.return_fields = 'id';
        return Restangular
          .one('reports')
          .one('phraseologies', phraseology.id)
          .withHttpConfig({treatingErrors: true})
          .customPUT(phraseology);
      };

      /**
       * Delete the phraseology
       *
       * @param phraseology
       * @returns {*}
       */
      service.deletePhraseology = function (phraseology) {
        $log.debug('Deleting phraseology [title: ' + phraseology.title + ', id: ' + phraseology.id + ']');
        return Restangular
          .all('reports')
          .withHttpConfig({treatingErrors: true})
          .one('phraseologies', phraseology.id).remove();
      };

      return service;
    });

})(angular);
