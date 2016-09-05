'use strict';

angular
  .module('GalleryImageOnLoadComponentModule', [])

  .directive('galleryImageOnLoad', function ($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          element.bind('load', function() {
            scope.$apply(function() {
              scope.loading = false;

              scope.$parent.imageDimensions = {width: element.width(), height: element.height()};
            });
          });
        }
    };
  });
