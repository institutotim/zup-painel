'use strict';

angular
  .module('GalleryComponentModule', [
    'GalleryModalControllerModule'
  ])

  .directive('gallery', function () {
    return {
        restrict: 'E',
        templateUrl: "components/gallery/gallery.template.html",
        scope: {
            images: '='
        },
        replace: true,

        controller: function ($scope, $modal) {
          $scope.show = function(image) {
            $modal.open({
              templateUrl: 'modals/gallery/gallery.template.html',
              windowClass: 'gallery-modal',
              controller: 'GalleryModalController',
              resolve: {
                image: function() {
                  return image;
                }
              }
            });
          };
        }
    };
  });
