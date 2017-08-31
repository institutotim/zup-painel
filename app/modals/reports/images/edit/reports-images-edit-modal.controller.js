(function (angular) {
  'use strict';

  angular
    .module('ReportsImagesEditModalModule', ['ReportsImagesServiceModule'])
    .controller('ReportsImagesEditModalController', ReportsImagesEditModalController)
    .factory('ReportsImagesEditModalService', ReportsImagesEditModalService);

  ReportsImagesEditModalController.$inject = [
    '$scope',
    '$rootScope',
    '$modalInstance',
    'parentScope',
    'image',
    'report',
    'ReportsImagesService'
  ];
  function ReportsImagesEditModalController($scope, $rootScope, $modalInstance, parentScope, image, report, ReportsImagesService) {
    $scope.image = image;
    $scope.report = report;
    $scope.close = $modalInstance.close;
    $scope.remove = remove;
    $scope.save = save;

    function remove() {
      parentScope.removeImage(image);
      $scope.close();
    }

    function save() {
      $scope.saving = true;

      var img = _.clone($scope.image);
      img.visibility = (img.visibility === true) ? 'internal' : 'visible';

      var promise = ReportsImagesService.updateImage(report.id, img);
      promise.then(function () {
        $scope.saving = false;
        parentScope.refreshImages();
        $scope.showMessage('ok', 'A imagem foi atualizada com sucesso', 'success', false);
        $scope.close();
      }, function () {
        $scope.saving = false;
        $rootScope.showMessage('exclamation-sign', 'Erro ao atualizar imagem', 'error', false);
        $scope.close();
      });
    }

    function _initialize() {
      $scope.image.visibility = ($scope.image.visibility === 'internal');
    }

    _initialize();
  }

  ReportsImagesEditModalService.$inject = ['$modal'];
  function ReportsImagesEditModalService($modal) {
    var self = {};

    self.open = open;

    function open(scope, report, image) {
      return $modal.open({
        templateUrl: 'modals/reports/images/edit/reports-images-edit-modal.template.html',
        windowClass: 'imagesEditModal',
        controller: 'ReportsImagesEditModalController',
        resolve: {
          parentScope: function () {
            return scope;
          },
          image: function () {
            return image;
          },
          report: function () {
            return report;
          }
        }
      }).result;
    }

    return self;
  }

})(angular);
