'use strict';

/**
 * Provides a custom angular-translate loader, fetching from the
 * terminology function.
 */
angular
  .module('ApiTranslationsLoaderModule', [])
  .factory('apiTranslationsLoader',
  ['$q', 'FullResponseRestangular', function ($q, FullResponseRestangular) {
  // return loaderFn
  return function (options) {
    var deferred = $q.defer();

    FullResponseRestangular.all('terminology').customGET().then(function(translations) {
      deferred.resolve(translations.data);
    });

    return deferred.promise;
  };
}]);
