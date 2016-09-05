'use strict';

angular
  .module('UsersEditControllerModule', [
    'ngCpfCnpj',
    'EqualsComponentModule',
    'GroupsSelectorInlineModule',
    'UsersServiceModule'
  ])

  .controller('UsersEditController', function ($scope, $rootScope, Restangular, UsersService, $stateParams, $location, groupsResponse, Error, moment) {
    var updating = $scope.updating = false;
    var userId = $stateParams.id;
    $scope.user = {groups: []};
    $scope.isObject = angular.isObject;

    if (typeof userId !== 'undefined') {
      updating = true;
      $scope.updating = true;
    }

    $scope.loading = true;

    if (updating) {
      UsersService.fetch(userId).then(function (user) {
        $scope.user = user;
        $scope.user.birthdate = moment($scope.user.birthdate).format('DD/MM/YYYY');
        $scope.loading = false;
      });
    }
    else {
      var groups = Restangular.stripRestangular(groupsResponse.data);

      $scope.loading = false;

      for (var i = groups.length - 1; i >= 0; i--) {
        if (groups[i].name === 'Público') {
          $scope.user.groups.push(groups[i]);
        }
      }
    }

    $scope.send = function () {
      $scope.inputErrors = null;
      $scope.processingForm = true;
      $rootScope.resolvingRequest = true;

      var user = angular.copy($scope.user);

      if (user.birthdate) {
        user.birthdate = moment(user.birthdate, 'DD/MM/YYYY').toJSON();
      }

      var extraParams = {};
      if ($scope.should_generate_password) {
        delete user.password;
        delete user.password_confirmation;
        extraParams.generate_password = true;
      }

      user.groups_ids = _.pluck(user.groups, 'id');

      // remove unecessary data from the request
      delete user.groups;

      // PUT if updating and POST if creating a new user
      if (updating) {

        var putUserPromise = UsersService.update(user, extraParams);

        putUserPromise.then(function () {
          $scope.showMessage('ok', 'O usuário foi atualizado com sucesso', 'success', true);

          $scope.processingForm = false;
          $rootScope.resolvingRequest = false;
        }, function (err) {
          $scope.showMessage('exclamation-sign', 'O usuário não pode ser salvo', 'error', true);

          $scope.inputErrors = err;

          $scope.processingForm = false;
          $rootScope.resolvingRequest = false;
        });
      }
      else {
        extraParams.return_fields = 'id';

        var postUserPromise = UsersService.create(user, extraParams);

        postUserPromise.then(function () {
          $scope.showMessage('ok', 'O usuário foi criado com sucesso', 'success', true);

          $location.path('/users');

          $scope.processingForm = false;
          $rootScope.resolvingRequest = false;
        }, function (err) {
          $scope.showMessage('exclamation-sign', 'O usuário não pode ser criado', 'error', true);

          $scope.inputErrors = err;

          $scope.processingForm = false;
          $rootScope.resolvingRequest = false;
        });
      }
    };
  });
