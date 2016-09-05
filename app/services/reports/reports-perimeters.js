'use strict';

/**
 * Provides an API client for the reports perimeters from ZUP API
 * @module ReportsPerimeters
 * @author Jairo André (jairo.andre@gmail.com)
 */
angular
  .module('ReportsPerimetersServiceModule', [])
  .factory('ReportsPerimetersService', function (Restangular, FullResponseRestangular, $rootScope, $q, $log, ReturnFieldsService) {

    var service = {}, perimeterOrder = 0;

    service.total = 0;

    service.perimeters = {};

    service.listAllReturnFields = [
      'id',
      'title',
      'shp_file',
      'shx_file',
      'status',
      'geometry'
    ];

    service.cleanCache = function () {
      $log.debug('Cleaning perimeters cache.');
      service.perimeters = {};
      service.total = 0;
      perimeterOrder = 0;
    };

    /**
     * Retrieve all perimeters
     *
     * @returns {*}
     */
    service.fetchAll = function (options) {
      $log.debug('Fetching perimeters');

      options = options || {};

      var defaults = {
        display_type: 'full',
        return_fields: ReturnFieldsService.convertToString([
          "id", "title", "status", "geometry", "created_at",
          {
            "group": [
              "id", "name"
            ]
          }
        ])
      };

      angular.merge(defaults, options);


      var promise = FullResponseRestangular
        .one('reports')
        .all('perimeters')
        .customGET(null, defaults);

      var deferred = $q.defer();

      promise.then(function (resp) {

        _.each(resp.data.perimeters, function (r) {
          if (typeof service.perimeters[r.id] === 'undefined') {
            r.order = perimeterOrder++;
          }
          service.perimeters[r.id] = r;
        });

        service.total = parseInt(resp.headers().total, 10);

        deferred.resolve(service.perimeters);

        $rootScope.$broadcast('perimetersFetched');

      }, function(){
        deferred.reject('Erro na consulta');
      });

      return deferred.promise;
    };

    /**
     * Add a new perimeter
     *
     * @param perimeter
     * @returns {*}
     */
    service.addPerimeter = function (perimeter) {
      $log.debug('Adding new perimeter/region [title: ' + perimeter.title + ', shp_file: ' + perimeter.shp_file.file_name + ', shx_file: ' + perimeter.shx_file.file_name + ']');
      perimeter.return_fields = 'id';
      return Restangular
        .one('reports')
        .withHttpConfig({treatingErrors: true})
        .post('perimeters', perimeter);
    };

    /**
     * Update an existing perimeter
     *
     * @param perimeter
     * @returns {*}
     */
    service.updatePerimeter = function (perimeter) {
      $log.debug('Update an existing perimeter/region [title: ' + perimeter.title + ', id: ' + perimeter.id + ']');
      perimeter.return_fields = 'id';
      return Restangular
        .one('reports')
        .one('perimeters', perimeter.id)
        .withHttpConfig({treatingErrors: true})
        .customPUT({title: perimeter.title});
    };

    /**
     * Delete the perimeter
     *
     * @param perimeter
     * @returns {*}
     */
    service.deletePerimeter = function (perimeter) {
      $log.debug('Deleting perimeter/region [id: ' + perimeter.id + ', title: ' + perimeter.title + ']');
      return Restangular
        .one('reports')
        .withHttpConfig({treatingErrors: true})
        .one('perimeters', perimeter.id).remove();
    };


    /**
     * Create a file uploader filter
     *
     * @param extension
     * @param uploader
     * @returns {{name: string, fn: Function}}
     */
    service.createFileUploaderFilter = function (extension, uploader) {
      return {
        name: extension + 'Filter',
        fn: function (item) {
          uploader.fileTypeError = false;
          uploader.fileTypeFileName = '';
          var type = (uploader.isHTML5 && item.type) ? item.type : '/' + item.name.slice(item.name.lastIndexOf('.') + 1);
          type = type.toLowerCase().slice(type.lastIndexOf('/') + 1);
          var equalsObj = extension.toLowerCase() === type;
          if (!equalsObj) {
            uploader.fileTypeError = true;
            uploader.fileTypeFileName = item.name;
          }
          return equalsObj;
        }
      }
    };

    /**
     * Save perimeter group
     *
     * @param perimeterGroup
     */
    service.savePerimeterGroup = function (perimeterGroup) {
      $log.debug(
        (perimeterGroup.id ? 'Update' : 'Create') + ' promise to perimeter group: [' +
        (perimeterGroup.id ? ('id: ' + perimeterGroup.id + ', ') : '') +
        'category_id: ' + perimeterGroup.category_id + ', ' +
        'group_id: ' + perimeterGroup.group_id + ', ' +
        'perimeter_id: ' + perimeterGroup.perimeter_id + ']');

      var requestParam = {perimeter_id: perimeterGroup.perimeter_id, group_id: perimeterGroup.group_id};

      var promise;

      if (perimeterGroup.id) {
        promise = Restangular
          .one('reports')
          .one('categories', perimeterGroup.category_id)
          .one('perimeters', perimeterGroup.id)
          .withHttpConfig({treatingErrors: true})
          .customPUT(requestParam);
      } else {
        requestParam.return_fields = 'id';
        promise = Restangular
          .one('reports')
          .one('categories', perimeterGroup.category_id)
          .withHttpConfig({treatingErrors: true})
          .post('perimeters', requestParam);
      }
      return promise;
    };

    /**
     * Delete the perimeter
     *
     * @param perimeter
     * @returns {*}
     */
    service.deletePerimeterGroup = function (perimeterGroup) {
      $log.debug('Deleting perimeter group [id: ' + perimeterGroup.id + ']');
      return Restangular
        .one('reports')
        .one('categories', perimeterGroup.category_id)
        .withHttpConfig({treatingErrors: true})
        .one('perimeters', perimeterGroup.id).remove();
    };

    /**
     *
     * @param categoryId
     */
    service.getPerimetersGroups = function (categoryId) {
      var promise = Restangular
        .one('reports')
        .one('categories', categoryId)
        .all('perimeters')
        .customGET(null, {display_type: 'full', return_fields: 'id,perimeter.title,group.id,perimeter.id,category.id'});
      var deferred = $q.defer();
      promise.then(function (resp) {
        service.perimetersGroups = [];
        _.each(resp.data, function (val) {
          var perimeterGroup = {};
          perimeterGroup.id = val.id;
          if (!_.isNull(val.perimeter)) {
            perimeterGroup.perimeter_id = val.perimeter.id;
          }
          perimeterGroup.group_id = val.group.id;
          perimeterGroup.category_id = val.category.id;
          perimeterGroup.title = val.perimeter.title;
          service.perimetersGroups.push(perimeterGroup);
        });
        deferred.resolve(service.perimetersGroups);
        $rootScope.$broadcast('perimetersGroupFetched');
      });
      return deferred.promise;
    };

    return service;
  });
