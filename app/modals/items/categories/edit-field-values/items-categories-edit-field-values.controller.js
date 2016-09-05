'use strict';

angular
  .module('ItemsCategoriesEditFieldValuesModalControllerModule', [
    'InventorySingleValueComponentModule'
  ])

  .controller('ItemsCategoriesEditFieldValuesModalController', function ($scope, $modalInstance, field, Restangular, setFieldOptions) {

    $scope.showErrors = false;
    $scope.errors = [];

    $scope.field = angular.copy(field);
    $scope.value = {importing: false};

    $scope.isExistingField = typeof $scope.field.id !== 'undefined' && $scope.field.id;

    if ($scope.field.field_options === null) {
      $scope.field.field_options = [];
    }

    $scope.toggleImport = function () {
      $scope.value.importing = !$scope.value.importing;
    };

    var verifyExistingOption = function (value) {
      var options = _.findWhere($scope.field.field_options, {value: value});

      return !angular.isUndefined(options);
    };

    var createField = function (values) {
      return Restangular.all('inventory').one('fields', field.id).post('options', values);
    };

    $scope.newValue = function () {
      if ($scope.loadingValue) {
        return;
      }

      $scope.loadingValue = true;
      $scope.showErrors = false;
      $scope.errors = [];

      if ($scope.value.importing === true && (!$scope.value.multipleOptionsText || $scope.value.multipleOptionsText.length === 0)) {
        $scope.errors.push('Você precisa de pelo menos um item para importar valores;');

        $scope.showErrors = true;
        $scope.loadingValue = false;

        return;
      }

      if ($scope.value.importing === false && (!$scope.value.text || $scope.value.text.length === 0)) {
        $scope.errors.push('O nome da opção não pode ficar em branco;');

        $scope.showErrors = true;
        $scope.loadingValue = false;

        return;
      }

      if ($scope.value.importing === true) {
        var newValues = $scope.value.multipleOptionsText.split(/\n/), fieldToBeCreated = [];

        for (var i = newValues.length - 1; i >= 0; i--) {
          if (verifyExistingOption(newValues[i])) {
            $scope.errors.push('A opção ' + newValues[i] + ' já existe;');
          }

          fieldToBeCreated.push(newValues[i]);
        }

        if ($scope.errors.length !== 0) {
          $scope.showErrors = true;
          $scope.loadingValue = false;

          return;
        }

        if (!$scope.isExistingField) {
          for (var i = fieldToBeCreated.length - 1; i >= 0; i--) {
            $scope.field.field_options.push({value: fieldToBeCreated[i], disabled: false});
          }

          $scope.loadingValue = false;

          setFieldOptions($scope.field.field_options);
        }
        else {
          createField({value: fieldToBeCreated}).then(function (response) {
            $scope.loadingValue = false;

            $scope.field.field_options.concat(response.data);

            setFieldOptions($scope.field.field_options);
          });
        }
      }
      else {
        if (verifyExistingOption($scope.value.text)) {
          $scope.errors.push('A opção ' + $scope.value.text + ' já existe;');

          $scope.showErrors = true;
          $scope.loadingValue = false;

          return;
        }

        var newOption = {value: $scope.value.text, disabled: false};

        if (!$scope.isExistingField) {
          $scope.field.field_options.push(newOption);

          $scope.loadingValue = false;

          setFieldOptions($scope.field.field_options);
        }
        else {
          createField(newOption).then(function (response) {
            $scope.loadingValue = false;

            $scope.field.field_options.push(response.data);

            setFieldOptions($scope.field.field_options);
          });
        }
      }

      $scope.value.multipleOptionsText = null;
      $scope.value.text = null;
    };

    $scope.clear = function () {
      $scope.field.field_options = [];

      setFieldOptions([]);
    };

    $scope.close = function () {
      $modalInstance.close();
    };

    $scope.save = function () {
      setFieldOptions($scope.field.field_options);

      $modalInstance.close();

    };
  });
