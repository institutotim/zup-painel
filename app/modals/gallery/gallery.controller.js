(function (angular) {
  'use strict';

  angular
    .module('GalleryModalControllerModule', [
      'panzoom',
      'panzoomwidget',
      'GalleryImageOnLoadComponentModule'
    ])
    .controller('GalleryModalController', GalleryModalController)
    .factory('GalleryModalService', GalleryModalService);

  GalleryModalController.$inject = [
    '$scope',
    '$modalInstance',
    '$window',
    'image'
  ];
  function GalleryModalController($scope, $modalInstance, $window, image) {
    $scope.loading = true;
    $scope.image = image;

    if (typeof image.url === 'undefined') {
      $scope.image.url = image.versions.original;
    }

    $scope.$watch('imageDimensions', function (newValue, oldValue) {
      if (newValue !== oldValue) {
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

    $scope.close = function () {
      $modalInstance.close();
    };
  }

  GalleryModalService.$inject = ['$modal'];
  function GalleryModalService($modal) {
    var self = {};

    self.open = open;

    function open(image) {
      return $modal.open({
        templateUrl: 'modals/gallery/gallery.template.html',
        windowClass: 'gallery-modal',
        controller: 'GalleryModalController',
        resolve: {
          image: function () {
            return image;
          }
        }
      }).result;
    }

    return self;
  }
})(angular);
