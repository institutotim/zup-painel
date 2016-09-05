(function (angular) {
  'use strict';

  angular
    .module('ServicesDisableModalControllerModule', [])

    .controller('ServicesDisableModalController', ServicesDisableModalController)
    .factory('ServicesDisableModalService', ServicesDisableModalService);

  ServicesDisableModalController.$inject = [
    'Restangular',
    '$scope',
    '$modalInstance',
    'service'
  ];
  function ServicesDisableModalController(Restangular, $scope, $modalInstance, service) {
    $scope.service = service;

    $scope.confirm = function () {
      var deletePromise = Restangular.one('services', $scope.service.id).remove();

      deletePromise.then(function () {
        $modalInstance.close();
        $scope.showMessage('ok', 'A aplicação ' + $scope.service.name + ' foi desativada com sucesso.', 'success', false);

        service.disabled = true;
      });
    };

    $scope.close = function () {
      $modalInstance.close();
    };
  }

  ServicesDisableModalService.$inject = ['$modal'];
  function ServicesDisableModalService($modal) {
    var self = {};

    self.open = open;

    function open(service) {
      return $modal.open({
        templateUrl: 'modals/services/disable/services-disable.template.html',
        windowClass: 'removeModal',
        resolve: {
          service: function () {
            return service;
          }
        },
        controller: 'ServicesDisableModalController'
      }).result;
    }

    return self;
  }
})(angular);
