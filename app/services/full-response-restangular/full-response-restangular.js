'use strict';

angular
  .module('FullResponseRestangularServiceModule', [])

.factory('FullResponseRestangular', ['Restangular', function(Restangular) {
  return Restangular.withConfig(function(RestangularConfigurer) {
    RestangularConfigurer.setFullResponse(true);
  });
}]);
