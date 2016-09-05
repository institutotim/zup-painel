'use strict';

/**
 * Provides a function for manipulation return field information
 * @module ReturnFieldsModule
 */
angular
  .module('ReturnFieldsModule', [])
  .factory('ReturnFieldsService', function ($q) {
    var self = {};

    var convert = function (query, prefix) {
      if (!_.isArray(query)) {
        if(prefix) {
          throw new Error("A `query` para o caminho `" + prefix + "` precisa ser um Array.");
        } else {
          throw new Error("A `query` precisa ser um Array.");
        }
      }

      return _.map(query, function(segment){
        if(_.isObject(segment)) {
          return _.map(_.keys(segment), function(key){
            return convert(segment[key], prefix ? prefix + '.' + key : key);
          });
        } else {
          return prefix ? prefix + '.' + segment : segment;
        }
      }).join();
    };

    /**
     * Convert array to valid return fields
     * @param {Array} data
     */
    self.convertToString = function (data) {
      return convert(data);
    };

    return self;
  });
