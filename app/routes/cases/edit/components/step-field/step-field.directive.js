'use strict';

angular
  .module('CaseStepFieldDirectiveModule', [
    'StepFieldValidatorDirectiveModule',
    'UploaderDirectiveModule',
    'ReportsSelectModalModule',
    'ItemsSelectModalModule'
  ])
  .directive('caseStepField', function () {
    return {
      restrict: 'E',
      scope: {
        field: '=',
        editable: '=',
        viewMode: '=',
        stepForm: '=',
        displayErrors: '='
      },
      templateUrl: 'routes/cases/edit/components/step-field/step-field.template.html',
      controller: function ($scope, ReportsSelectModalService, ItemsSelectModalService) {
        $scope.field.itemBeingCreated = false;
        $scope.getExtensions = function (type) {
          var extensions = {
            image: 'png|jpg|gif|jpeg'
          };

          return extensions[type];
        };

        $scope.isInputType = function (inputType) {
          var inputTypes = {
            'metric': [
              'meter', 'centimeter', 'kilometer',
              'year', 'month', 'day',
              'hour', 'hours', 'minute', 'second',
              'angle'
            ],
            'normal_text': [
              'text', 'url', 'email'
            ],
            'small_text': [
              'date', 'time'
            ],
            'number': [
              'decimal', 'integer'
            ],
            'file': ['image', 'attachment']
          };

          return _.contains(inputTypes[inputType], $scope.field.type);
        };

        $scope.translateMetric = function (metric) {
          var metrics = {
            'meter': 'm',
            'centimeter': 'cm',
            'kilometer': 'km',
            'year': 'anos',
            'month': 'meses',
            'day': 'dias',
            'hour': 'horas',
            'hours': 'horas',
            'minute': 'minutos',
            'second': 'segundos',
            'angle': '° (graus)'
          };

          return metrics[metric];
        };

        $scope.getMask = function(){
          switch($scope.field.type) {
            case 'cpf':
              return '999.999.999-99';
            case 'cnpj':
              return '99.999.999/9999-99';
            case 'date':
              return '99/99/9999';
            case 'time':
              return '99:99';
          }
        };

        $scope.invalid = function(){
          return $scope.stepForm["field_" + $scope.field.id].$invalid || $scope.field.has_errors;
        };

        $scope.errorMessage = function(){
          var field = $scope.stepForm['field_' + $scope.field.id];

          if($scope.field.has_errors) {
            _.extend(field.$error, $scope.field.errors);
          }

          if(field.$error.required) {
            return 'O preenchimento deste campo é obrigatório.';
          } else if (field.$error.cpf) {
            return 'O CPF é inválido.';
          } else if (field.$error.cnpj) {
            return 'O CNPJ é inválido.';
          } else if (field.$error.url) {
            return 'A URL é inválida.';
          } else if (field.$error.email) {
            return 'O Email é inválido.';
          } else if (field.$error.mask) {
            return 'O formato está inválido.';
          } else if (field.$error.date) {
            return 'A data é inválida.';
          } else if (field.$error.maxLength) {
            return 'O campo não pode possuir mais de ' + $scope.field.requirements.maximum + ' caracteres.';
          } else if (field.$error.minLength) {
            return 'O campo deve possuir mais de ' + $scope.field.requirements.minimum + ' caracteres.';
          }
        };

        $scope.addInventories = function () {
          if (!_.isArray($scope.field.value)) {
            $scope.field.value = [];
          }

          ItemsSelectModalService.open(
            $scope.field.value,
            _.pluck($scope.field.category_inventory, 'id'),
            $scope.field.requirements && $scope.field.requirements.multiple
          ).then(function (items) {
            $scope.field.value = items;
            // we use this on <step/> to load the values of inventory_fields
            $scope.$emit('cases:inventory_items_selected', $scope.field);
          });
        };

        $scope.addReports = function () {
          if (!_.isArray($scope.field.value)) {
            $scope.field.value = [];
          }

          ReportsSelectModalService.open(
            $scope.field.value,
            _.pluck($scope.field.category_report, 'id'),
            $scope.field.requirements && $scope.field.requirements.multiple
          ).then(function (reports) {
            $scope.field.value = reports;
          });
        };

        var removeSelection = $scope.removeReport = function (index) {
          $scope.field.value.splice(index, 1);
        };

        $scope.removeItem = function(index){
          removeSelection(index);
          $scope.$emit('cases:inventory_items_removed', $scope.field);
        };

        var getSelectedValues = function(field){
          var values = [];

          _.each(field.values, function(option, i){
            if(field.value[i]) {
              values.push(option.value);
            }
          });

          return values;
        };

        var convertInventoryField = function(field){
          switch(field.type) {
            case 'textarea':
              field.type = 'text';
              field.requirements = _.extend({}, field.requirements, { multiline: true });
              break;
            case 'centimeters':
            case 'kilometers':
            case 'years':
            case 'hours':
            case 'months':
            case 'days':
            case 'seconds':
            case 'meters':
            case 'images':
              field.type = field.type.substr(0, field.type.length - 1);
              break;
          }
        };

        $scope.getLabelForInventoryChoiceField = function(field){
          if(field.value) {
            return _.findWhere(field.values, { value: field.value }).label;
          }
        };

        // Data is persistent in `field.data`, so in order to simplify things around here we mirror that on field.value
        $scope.$watch('field', function (field) {
          if (field) {
            if(field.type == 'inventory_field') {
              _.extend($scope.field, field.inventory_field);
              convertInventoryField($scope.field);
              $scope.field.inventory_field = true;
            }

            if(field.type == 'previous_field') {
              _.extend($scope.field, field.previous_field);
              $scope.field.previous_field = true;
            }

            if(field.type == 'inventory_item' && $scope.field.value && $scope.field.value.length > 0) {
              $scope.$emit('cases:inventory_items_selected', $scope.field);
            }

            switch ($scope.field.type) {
              case 'image':
              case 'attachment':
                $scope.field.value = $scope.field.value || [];
                break;
            }

            if(field.type == 'image' || field.type == 'attachment') {
              _.each(field.value, function(fileObject){
                if(fileObject.content) {
                  fileObject.content = fileObject.content.replace(/^data:[^;]+;base64,/, '');
                }
              })
            }

            if(field.type == 'checkbox' && field.value) {
              field.selected_values = getSelectedValues(field);
            }
          }
        }, true);
      }
    };
  });
