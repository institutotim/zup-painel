'use strict';

angular
  .module('UploaderDirectiveModule', [])
  .directive('uploader', function ($q, FileUploader) {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      templateUrl: 'components/uploader/uploader.template.html',
      scope: {
        files: '=',
        extensions: '@',
        multiple: '='
      },
      link: {
        pre: preLink
      }
    };

    function preLink($scope, element, attrs, ctrl, transclude) {
      $scope.uploader = new FileUploader();

      if (_.isString($scope.extensions)) {
        $scope.uploader.filters.push({ name: 'extensions', fn: extensionsFilter })
      }

      // This function mimics the behaviour of the `FileUploader#removeFromQueue`
      // this is necessary because one cannot save the reference to the FileItem on the scope
      // (otherwise a infinite loop occurs) and, contrary to what the inline documentation on `#removeFromQueue` says
      // it does not accept an Number (with the index of the item to be removed).
      var removeIndexFromQueue = function(index){
        var item = $scope.uploader.queue[index];
        if (item.isUploading) item.cancel();
        $scope.uploader.queue.splice(index, 1);
        var fileSelector = element.find('input[type="file"]')[0];
        fileSelector.value = '';
      };

      $scope.uploader.onAfterAddingFile = function (item) {
        readAsyncFile(item._file).then(function (content) {
          $scope.files.push({
            file_name: item.file.name,
            content: content,
            url: content,
            queue_index: $scope.uploader.getIndexOfItem(item)
          });
        });
        var fileSelector = element.find('input[type="file"]')[0];
        fileSelector.value = '';
      };

      $scope.uploader.remove = function (item) {
        if (!item.id) {
          $scope.files.splice($scope.files.indexOf(item), 1);
          removeIndexFromQueue(item.queue_index);
        } else {
          item.destroy = true;
          if($scope.files.indexOf(item) == -1) {
            $scope.files.push(item);
          }
        }
      };

      transclude($scope.$parent, function (clone, scope) {
        scope.$uploader = $scope.uploader;
        element.append(clone);
      });

      function extensionsFilter(item) {
        return new RegExp('\.(' + $scope.extensions + ')').test(item.type);
      }

      function readAsyncFile(file) {
        var reader  = new FileReader();
        var deferred = $q.defer();

        reader.addEventListener('load', function () {
          deferred.resolve(reader.result);
        }, false);

        reader.addEventListener('error', function () {
          deferred.reject();
        }, false);

        reader.addEventListener('abort', function () {
          deferred.reject();
        }, false);

        reader.readAsDataURL(file);

        return deferred.promise;
      }
    }
  });
