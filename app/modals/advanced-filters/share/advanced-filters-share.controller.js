'use strict';

angular
  .module('AdvancedFiltersShareModalControllerModule', [
    'CopyTextComponentModule'
  ])

  .controller('AdvancedFiltersShareModalController', function($scope, $modalInstance, $q, url) {
    $scope.url = url;

    $scope.close = function() {
      $modalInstance.close();
    };
  });
