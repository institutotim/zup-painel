(function (angular, _) {
  'use strict';

  angular
    .module('UsersEditModalModule', [
      'UsersServiceModule'
    ])
    .controller('UsersEditModalController', UsersEditModalController)
    .factory('UsersEditModalService', UsersEditModalService);

  UsersEditModalController.$inject = [
    '$rootScope',
    '$modalInstance',
    'moment',
    'UsersService',
    'user'
  ];
  function UsersEditModalController($rootScope, $modalInstance, moment, UsersService, user) {
    var vm = this;

    vm.user = angular.copy(user);
    vm.isUpdating = !!user;
    vm.save = save;
    vm.close = close;
    vm.isObject = _.isObject;

    function initialize() {
      if (user) {
        vm.user.birthdate = moment(user.birthdate).format('DD/MM/YYYY');
      }
    }

    function save() {
      var promise, message;

      if (vm.user.birthdate) {
        vm.user.birthdate = moment(vm.user.birthdate, 'DD/MM/YYYY').toJSON();
      }

      if (vm.isUpdating) {
        promise = UsersService.update(vm.user);
        message = 'Usuário atualizado com sucesso';
      } else {
        vm.user.generate_password = true;
        promise = UsersService.create(vm.user);
        message = 'Usuário criado com sucesso';
      }

      return promise
        .then(function (user) {
          $rootScope.showMessage('ok', message, 'success', true);
          $modalInstance.close(user);
        })
        .catch(function (err) {
          vm.errors = err;
        });
    }

    function close() {
      $modalInstance.dismiss();
    }

    initialize();
  }

  UsersEditModalService.$inject = ['$modal'];
  function UsersEditModalService($modal) {
    var self = {};

    self.open = open;

    function open(user) {
      return $modal.open({
        windowClass: 'usersEditModal',
        templateUrl: 'modals/users/edit/users-edit.template.html',
        resolve: {
          user: function () {
            return user;
          }
        },
        controller: 'UsersEditModalController',
        controllerAs: 'vm'
      }).result;
    }

    return self;
  }
})(angular, _);
