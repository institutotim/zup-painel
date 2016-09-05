'use strict';

angular
  .module('AdvancedFiltersFieldsModalControllerModule', [
    'FieldsFilterItemComponentModule',
    'InventoriesCategoriesServiceModule'
  ])
  .controller('AdvancedFiltersFieldsModalController', function($scope, $rootScope, $modalInstance, activeAdvancedFilters, categoriesResponse, InventoriesCategoriesService) {
    $rootScope.resolvingRequest = false;

    $scope.categories = categoriesResponse.data ? categoriesResponse.data : categoriesResponse;

    if($scope.categories.categories) {
      $scope.categories = $scope.categories.categories;
    }

    $scope.activeAdvancedFilters = activeAdvancedFilters;

    $scope.items = [];

    $scope.methods = [
      { condition: 'greater_than', canSelectMultiple: false, text: 'Maior que', availableKinds: ['text', 'integer', 'decimal', 'meters', 'centimeters', 'kilometers', 'years', 'months', 'days', 'hours', 'seconds', 'angle'] },
      { condition: 'lesser_than', canSelectMultiple: false, text: 'Menor que', availableKinds: ['text', 'integer', 'decimal', 'meters', 'centimeters', 'kilometers', 'years', 'months', 'days', 'hours', 'seconds', 'angle'] },
      { condition: 'equal_to', canSelectMultiple: false, text: 'Igual a', availableKinds: ['text', 'integer', 'decimal', 'checkbox', 'radio', 'select', 'meters', 'centimeters', 'kilometers', 'years', 'months', 'days', 'hours', 'seconds', 'angle', 'date', 'time', 'cpf', 'cnpj', 'url', 'email'] },
      { condition: 'different', canSelectMultiple: false, text: 'Diferente de', availableKinds: ['text', 'integer', 'decimal', 'checkbox', 'radio', 'select', 'meters', 'centimeters', 'kilometers', 'years', 'months', 'days', 'hours', 'seconds', 'angle', 'date', 'time', 'cpf', 'cnpj', 'url', 'email'] },
      { condition: 'like', canSelectMultiple: false, text: 'Parecido com', availableKinds: ['text', 'integer', 'decimal', 'meters', 'centimeters', 'kilometers', 'years', 'months', 'days', 'hours', 'seconds', 'angle', 'date', 'time', 'cpf', 'cnpj', 'url', 'email'] },
      { condition: 'includes', canSelectMultiple: true, text: 'Inclui', availableKinds: ['checkbox', 'radio', 'select'] },
      { condition: 'excludes', canSelectMultiple: true, text: 'Não inclui', availableKinds: ['checkbox', 'radio', 'select'] },
    ];

    $scope.newField = {
      category: null,
      condition: null,
      field: null,
      value: null
    };

    $scope.selectCategory = function(category) {

      $scope.loading = true;
      $scope.newField.category = false;

      var promise = InventoriesCategoriesService.getCategory(category.id);

      promise.then(function(response) {
        $scope.newField.category = response.data;
        $scope.newField.condition = null;
        $scope.newField.field = null;
        $scope.newField.value = null;
        $scope.newField.fieldId = null;

        $scope.loading = false;
      });
    };

    $scope.selectCondition = function(condition) {
      $scope.newField.condition = condition;
    };

    $scope.$watch('newField.fieldId', function() {
      if ($scope.newField.category !== null && $scope.newField.fieldId !== null)
      {
        for (var k = $scope.newField.category.sections.length - 1; k >= 0; k--) {
          var section = $scope.newField.category.sections[k];

          for (var i = section.fields.length - 1; i >= 0; i--) {
            if (section.fields[i].id == $scope.newField.fieldId)
            {
              $scope.newField.field = section.fields[i];

              $scope.selectCondition(null);
            }
          };
        };
      }
    });

    $scope.selectField = function(field) {
      $scope.newField.field = field;
    };

    $scope.addItem = function() {
      $scope.items.push(angular.copy($scope.newField));

      $scope.newField.condition = null;
      $scope.newField.field = null;
      $scope.newField.value = null;
      $scope.newField.fieldId = null;
    };

    $scope.save = function() {
      for (var i = $scope.items.length - 1; i >= 0; i--) {
        var filter = {
          title: 'Campo',
          type: 'fields',
          desc: $scope.items[i].field.label + ': ' + $scope.items[i].condition.text + ' ' + $scope.items[i].value,
          value: {id: $scope.items[i].field.id, condition: $scope.items[i].condition.condition, value: $scope.items[i].value}
        };

        $scope.activeAdvancedFilters.push(filter);
      }

      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
