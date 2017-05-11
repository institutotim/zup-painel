(function (angular) {
  'use strict';

  angular
    .module('ReportsImagesDestroyModalModule', ['ReportsImagesServiceModule'])
    .controller('ReportsImagesDestroyModalController', ReportsImagesDestroyModalController)
    .factory('ReportsImagesDestroyModalService', ReportsImagesDestroyModalService);

  ReportsImagesDestroyModalController.$inject = [
    '$scope',
    '$rootScope',
    '$modalInstance',
    'parentScope',
    'image',
    'report',
    'ReportsImagesService'
  ];
  function ReportsImagesDestroyModalController($scope, $rootScope, $modalInstance, parentScope, image, report, ReportsImagesService) {
    $scope.image = image;
    $scope.report = report;
    $scope.close = $modalInstance.close;
    $scope.confirm = confirm;

    function confirm() {
      var promise = ReportsImagesService.deleteImage($scope.report.id, $scope.image);

      $scope.deleting = true;
      promise.then(function () {
        $scope.deleting = false;
        parentScope.refreshImages();
        $scope.showMessage('ok', 'A imagem foi removida com sucesso', 'success', false);
        $scope.close();
      }, function () {
        $scope.deleting = false;
        $rootScope.showMessage('exclamation-sign', 'Erro ao remover imagem.', 'error', false);
        $scope.close();
      });
    }

    function _initialize() {
    }

    _initialize();
  }

  ReportsImagesDestroyModalService.$inject = ['$modal'];
  function ReportsImagesDestroyModalService($modal) {
    var self = {};

    self.open = open;

    function open(scope, report, image) {
      return $modal.open({
        templateUrl: 'modals/reports/images/destroy/reports-images-destroy-modal.template.html',
        windowClass: 'imagesDestroyModal',
        controller: 'ReportsImagesDestroyModalController',
        resolve: {
          parentScope: function () {
            return scope;
          },
          report: function () {
            return report;
          },
          image: function () {
            return image;
          }
        }
      }).result;
    }

    return self;
  }

})(angular);
