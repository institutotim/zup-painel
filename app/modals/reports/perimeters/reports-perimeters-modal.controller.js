'use strict';

angular
  .module('ReportsPerimetersModalControllerModule', ['ReportsPerimetersServiceModule'])

  .controller('ReportsPerimetersModalController', function ($scope, $modalInstance, $log, $rootScope, FileUploader, $q, parentScope, ReportsPerimetersService, Restangular) {

    $log.info('ReportsPerimetersModalController created.');
    $scope.$on('$destroy', function () {
      $log.info('ReportsPerimetersModalController destroyed.');
    });

    var service = ReportsPerimetersService;

    $scope.perimeter = {};

    $scope.groups = {};

    Restangular.all('groups').getList({ return_fields: 'id,name'}).then(function(r){
      $scope.groups = r.data;
    });

    $scope.mandatoryCheckFlags = [true, true, true];

    var uploaderShp = $scope.uploaderShp = new FileUploader();
    var uploaderShx = $scope.uploaderShx = new FileUploader();

    uploaderShp.filters.push(service.createFileUploaderFilter('shp',uploaderShp));
    uploaderShx.filters.push(service.createFileUploaderFilter('shx',uploaderShx));

    var checkMandatoryFields = function() {
      $scope.mandatoryCheckFlags = [true, true, true];

      if(uploaderShp.queue.length === 0){
        $scope.mandatoryCheckFlags[0] = false;
      }
      if(uploaderShx.queue.length === 0){
        $scope.mandatoryCheckFlags[1] = false;
      }
      if(!$scope.perimeter.title){
        $scope.mandatoryCheckFlags[2] = false;
      }
      return $scope.mandatoryCheckFlags[0] && $scope.mandatoryCheckFlags[1] && $scope.mandatoryCheckFlags[2];
    }

    var addAsyncFiles = function (data) {
      var deferred = $q.defer();

      var fileReader = new FileReader();

      fileReader.addEventListener('load', function (event) {
        var file = event.target;
        var hash = {};
        hash.file_name = data.file.name;
        hash.content = file.result.replace(/^data:;base64,/, '');
        deferred.resolve(hash);
      });

      // pass as base64 and strip "data:;base64,"
      fileReader.readAsDataURL(data._file);

      return deferred.promise;
    };

    $scope.save = function() {
      $log.info('Saving perimeter.')
      if(checkMandatoryFields()){
        var filePromises = [];
        filePromises.push(addAsyncFiles(uploaderShp.queue[0]));
        filePromises.push(addAsyncFiles(uploaderShx.queue[0]));
        $q.all(filePromises).then(function(hashes){
          $scope.perimeter.shp_file = hashes[0];
          $scope.perimeter.shx_file = hashes[1];
          $scope.confirmPromise = service.addPerimeter($scope.perimeter).then(function(){
            parentScope.cleanCache();
            parentScope.getData();
            $rootScope.showMessage('ok','Perímetro cadastrado com sucesso.','success',false);
            $modalInstance.close();
            $scope.confirmPromise = null;
          }, function(){
            $rootScope.showMessage('exclamation-sign','Não foi possível cadastrar o perímetro, tente novamente.','error',true);
            $modalInstance.close();
            $scope.confirmPromise = null;
          });
        });
      }
    }

    $scope.close = function () {
      $modalInstance.close();
    };
  });
