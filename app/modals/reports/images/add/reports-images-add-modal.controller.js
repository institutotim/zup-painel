(function (angular) {
  'use strict';

  angular
    .module('ReportsImagesAddModalModule', ['ReportsImagesServiceModule'])
    .controller('ReportsImagesAddModalController', ReportsImagesAddModalController)
    .factory('ReportsImagesAddModalService', ReportsImagesAddModalService);

  ReportsImagesAddModalController.$inject = [
    '$scope',
    '$rootScope',
    '$modalInstance',
    '$q',
    'parentScope',
    'report',
    'ReportsImagesService',
    'FileUploader',
    'onlyImagesUploaderFilter'
  ];
  function ReportsImagesAddModalController($scope, $rootScope, $modalInstance, $q, parentScope, report, ReportsImagesService, FileUploader, onlyImagesUploaderFilter) {
    $scope.uploader = new FileUploader();
    $scope.close = $modalInstance.close;
    $scope.isReadyToSave = isReadyToSave;
    $scope.save = save;

    function isReadyToSave() {
      var invalidImages = _.filter($scope.uploader.queue, function (image) {
        return (image.file.title || '').length > 120;
      });

      return _.size(invalidImages) === 0;
    }

    function save() {
      $scope.saving = true;

      var loadingImages = [];
      _.each($scope.uploader.queue, function (img) {
        var deferred = $q.defer();
        loadingImages.push(deferred.promise);

        var picReader = new FileReader();
        picReader.addEventListener('load', function (event) {
          var picFile = event.target;
          var image = {};
          image.content = picFile.result.replace(/^data:image\/[^;]+;base64,/, '');
          image.title = img.file.title;
          image.file_name = img.file.name;
          image.visibility = (img.file.visibility) ? 'internal' : 'visible';
          deferred.resolve(image);
        });
        // pass as base64 and strip data:image
        picReader.readAsDataURL(img._file);
      });

      $q.all(loadingImages).then(function (images) {
        var promise = ReportsImagesService.addImage(report.id, _.toArray(images));
        promise.then(function () {
          $scope.saving = false;
          parentScope.refreshImages();
          $scope.showMessage('ok', 'Imagens adicionadas com sucesso', 'success', false);
          $scope.close();
        }, function () {
          $scope.saving = false;
          $rootScope.showMessage('exclamation-sign', 'Erro ao adicionar imagens', 'error', false);
          $scope.close();
        });
      });
    }

    function _initialize() {
      $scope.uploader.filters.push(onlyImagesUploaderFilter($scope.uploader.isHTML5));
    }

    _initialize();
  }

  ReportsImagesAddModalService.$inject = ['$modal'];
  function ReportsImagesAddModalService($modal) {
    var self = {};

    self.open = open;

    function open(scope, report) {
      return $modal.open({
        templateUrl: 'modals/reports/images/add/reports-images-add-modal.template.html',
        windowClass: 'imagesAddModal',
        controller: 'ReportsImagesAddModalController',
        resolve: {
          parentScope: function () {
            return scope;
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
