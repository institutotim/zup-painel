'use strict';

angular
  .module('GalleryModalControllerModule', [
    'panzoom',
    'panzoomwidget',
    'GalleryImageOnLoadComponentModule'
  ])

  .controller('GalleryModalController', function($scope, $modalInstance, $window, image) {
    $scope.loading = true;
    $scope.image = image;

    

    if (typeof image.url === 'undefined')
    {
      $scope.image.url = image.versions.original;
    }

    $scope.$watch('imageDimensions', function(newValue, oldValue) {
      if (newValue !== oldValue)
      {
        $scope.panzoomConfig = {
          zoomLevels: 12,
          neutralZoomLevel: 5,
          scalePerZoomLevel: 1.5,
          useHardwareAcceleration: true,
          initialPanX: ($($window).width() / 2) - ($scope.imageDimensions.width / 2),
          initialPanY: ($($window).height() / 2) - ($scope.imageDimensions.height / 2)
        };
      }
    });

    $scope.panzoomModel = {};

    $scope.close = function() {
      $modalInstance.close();
    };
  });
