(function (angular, _) {
  'use strict';

  /**
   * Provides an API client for the reports images from ZUP API
   * @module ReportsImages
   * @author Rodrigo Gomes da Silva (rodrigo.smscom@gmail.com)
   */
  angular
    .module('ReportsImagesServiceModule', [])
    .factory('ReportsImagesService', ReportsImagesService);

  ReportsImagesService.$inject = [
    'FullResponseRestangular',
    '$log'
  ];
  function ReportsImagesService(FullResponseRestangular, $log) {

    var service = {};

    service.listAllReturnFields = [
      'id',
      'title',
      'content',
      'file_name',
      'origin',
      'visibility'
    ];

    /**
     *
     * @param images
     */
    service.toArray = function (images) {
      if (images instanceof Array) {
        return images;
      }

      return [images];
    };

    /**
     * Get images from a report.
     *
     * @param report_id
     * @param options
     * @returns {*}
     */
    service.listImages = function (report_id, options) {
      options = options || {};
      options.return_fields = (options.return_fields || service.listAllReturnFields).join();
      options.display_type = 'full';

      var url = FullResponseRestangular
        .all('reports').one('items', report_id).all('images')
        .withHttpConfig({treatingErrors: true});

      return url.customGET(null, options);
    };

    /**
     * Add new images to a report.
     *
     * @param report_id
     * @param images
     * @returns {*}
     */
    service.addImage = function (report_id, images) {
      images = service.toArray(images);

      _.each(images, function (image) {
        $log.debug('Adding new image [report: ' + report_id + ', title: ' + image.title + ']');
        image.origin = 'fiscal';
      });

      var url = FullResponseRestangular
        .all('reports').one('items', report_id).all('images')
        .withHttpConfig({treatingErrors: true});

      return url.customPOST({images: images});
    };

    /**
     * Update existing images in a report.
     *
     * @param report_id
     * @param images
     * @returns {*}
     */
    service.updateImage = function (report_id, images) {
      images = service.toArray(images);

      _.each(images, function (image) {
        $log.debug('Update an existing image [report: ' + report_id + ', title: ' + image.title + ', id: ' + image.id + ']');
      });

      var url = FullResponseRestangular
        .all('reports').one('items', report_id).all('images')
        .withHttpConfig({treatingErrors: true});

      return url.customPUT({images: images});
    };

    /**
     * Delete a image from a report.
     *
     * @param report_id
     * @param image
     * @returns {*}
     */
    service.deleteImage = function (report_id, image) {
      $log.debug('Deleting image [report: ' + report_id + ', title: ' + image.title + ', id: ' + image.id + ']');

      var url = FullResponseRestangular
        .all('reports').one('items', report_id)
        .one('images', image.id)
        .withHttpConfig({treatingErrors: true});

      return url.remove();
    };

    return service;
  }
})(angular, _);
