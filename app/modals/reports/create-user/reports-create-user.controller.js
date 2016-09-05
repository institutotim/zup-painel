'use strict';

angular
  .module('ReportsCreateUserModalControllerModule', [
    'ngCpfCnpj',
    'UsersServiceModule'
  ])

  .controller('ReportsCreateUserModalController', function (UsersService, $scope, moment, $modalInstance, $q, setUser) {
    $scope.user = {};
    $scope.inputErrors = null;
    $scope.isObject = _.isObject;

    $scope.create = function () {
      $scope.inputErrors = null;
      $scope.processingForm = true;

      if ($scope.user.birthdate) {
        $scope.user.birthdate = moment($scope.user.birthdate, 'DD/MM/YYYY').toJSON();
      }

      $scope.createUserPromise = UsersService.create($scope.user, {
        return_fields: 'id,name',
        generate_password: true
      })

      $scope.createUserPromise
        .then(function (user) {
          setUser(user);
          $modalInstance.close();

          $scope.processingForm = false;
        })
        .catch(function (err) {
          $scope.inputErrors = err;
          $scope.processingForm = false;
        });
    };

    $scope.close = function () {
      $modalInstance.close();
    };
  });
