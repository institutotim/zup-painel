'use strict';

angular
  .module('UploaderDirectiveModule')
  .directive('uploaderDropzone', function () {
    return {
      restrict: 'E',
      replace: true,
      require: '^uploader',
      templateUrl: 'components/uploader/dropzone/uploader-dropzone.template.html'
    };
  });
