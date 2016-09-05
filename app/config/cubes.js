/**
 * Provides a centralized location for getting the cubes configuration that is used in both zupPainelApp and cv modules
 */
angular.module('cubesConfigurationModule', [])
  .constant('cvOptions', {})
  .factory('cubesConfigurationService', ['$rootScope', 'cvOptions', function ($rootScope, cvOptions) {
  var $scope = $rootScope.$new(true);

  return {
    bus: function(){
      return $scope;
    },
    setCubesUrl: function(url){
      cvOptions.cubesUrl = url;
      $scope.$emit('cubesUrlChanged', url);
    }
  }
}]);
