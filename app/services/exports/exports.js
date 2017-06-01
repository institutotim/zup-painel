(function (angular, _) {
  'use strict';

  angular
    .module('ExportsServiceModule', [])
    .factory('ExportsService', ExportsService);

  ExportsService.$inject = ['Restangular', '$q'];
  function ExportsService(Restangular, $q) {
    var self = {};

    self.fetchAll = fetchAll;
    self.export = exportFn;
    self.remove = remove;

    return self;

    function fetchAll(opts) {
      var options = _.extend({}, opts);

      return Restangular
        .all('exports')
        .withHttpConfig({ treatingErrors: true })
        .customGET(null, options)
        .then(function (response) {
          return response.data;
        });
    };

    function exportFn(kind, itemCategoryId, filters) {
      return Restangular
        .all('exports')
        .withHttpConfig({ treatingErrors: true })
        .post({
          kind: kind,
          inventory_category_id: itemCategoryId,
          filters: filters
        })
        .then(function (response) {
          return response.data.export;
        })
        .catch(function (response) {
          return $q.reject(response.data.error);
        });
    };

    function remove(id) {
      return Restangular
        .one('exports', id)
        .withHttpConfig({ treatingErrors: true })
        .remove();
    }
  }
})(angular, _);
