(function (angular, _) {
  'use strict';

  /**
   * Authorization provider exposes simplified authorization functions.
   */
  angular
    .module('AuthorizationProviderModule', [])
    .factory('Authorization', Authorization);

  Authorization.$inject = ['$rootScope', '$state'];
  function Authorization($rootScope, $state) {
    return {
      authorize: authorize
    };

    function authorize(permissions, ids, callback) {
      var fn = _.isString(permissions) ? $rootScope.hasPermission : $rootScope.hasAnyPermission;
      var isAuthorized = fn(permissions, ids || undefined);

      if (callback) {
        fn = _.isFunction(callback) ? callback : _defaultCallback;
        fn(isAuthorized, _redirectFn);
      }

      return isAuthorized;
    }

    function _redirectFn() {
      $rootScope.showMessage(
        'exclamation-sign',
        'Você não possui permissão para visualizar essa página.',
        'error'
      );

      return $state.go('items.list', {}, { reload: true });
    }

    function _defaultCallback(isAuthorized, redirectFn) {
      if (!isAuthorized) redirectFn();
    }
  }
})(angular, _);
