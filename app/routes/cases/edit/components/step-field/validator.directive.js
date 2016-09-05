'use strict';

angular
  .module('StepFieldValidatorDirectiveModule', [])
  .directive('stepFieldValidator', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, el, attrs, ctrl) {
        $scope.field.errors = {};

        var setError = function (type, validity) {
          $scope.field.errors[type] = validity;
          $scope.field.has_errors = _.any(_.filter($scope.field.errors, function (v) {
            return v;
          }));
        };

        var validateUploadField = function () {
          if ($scope.field.requirements && $scope.field.requirements.presence) {
            var validUploads = _.filter($scope.field.value, function (f) {
              return !f.destroy;
            });
            if (!$scope.field.value || validUploads.length < 1) {
              setError('required', true);
            } else {
              setError('required', false);
            }
          }
        };

        var validateCheckbox = function () {
          if ($scope.field.requirements.presence && !_.any(_.values($scope.field.value))) {
            setError('required', true);
          } else {
            setError('required', false);
          }
        };

        var validateCPF = function (value) {
          if (value && !CPF.isValid(value.replace(/[^\d]/g, ''))) {
            setError('cpf', true);
          } else {
            setError('cpf', false);
          }
        };

        var validateCNPJ = function (value) {
          if (value && !CNPJ.isValid(value.replace(/[^\d]/g, ''))) {
            setError('cnpj', true);
          } else {
            setError('cnpj', false);
          }
        };

        var validateURL = function (value) {
          var regex = /(^$)|(^(http|https|ftp|udp):\/\/[a-z0-9]+([\-\.][a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?([\/].*)?$)/i;
          if (value && value.match(regex)) {
            setError('url', false);
          } else {
            setError('url', true);
          }
        };

        var validateEmail = function (value) {
          var regex = /^([^\s]+)((?:[-a-z0-9]\.)[a-z]{2,})$/;
          if (value && value.match(regex)) {
            setError('email', false);
          } else {
            setError('email', true);
          }
        };

        var validateDate = function (value) {
          if (!value) {
            setError('date', false);
            return true;
          }

          try {
            $.datepicker.parseDate('dd/mm/yy', value);
            setError('date', false);
          } catch(e) {
            setError('date', true);
          }
        };

        var validateMaxLength = function (value) {
          if (value && value.length > parseInt($scope.field.requirements.maximum, 10)) {
            setError('maxLength', true);
          } else {
            setError('maxLength', false);
          }
        };

        var validateMinLength = function (value) {
          if (value && value.length < parseInt($scope.field.requirements.minimum, 10)) {
            setError('minLength', true);
          } else {
            setError('minLength', false);
          }
        };

        switch ($scope.field.type) {
          case 'attachment':
          case 'image':
          case 'report_item':
          case 'inventory_item':
            $scope.$watch('field.value', validateUploadField, true);
            break;
          case 'checkbox':
            $scope.$watch('field.value', validateCheckbox, true);
            break;
          case 'cpf':
            $scope.$watch('field.value', validateCPF, true);
            break;
          case 'cnpj':
            $scope.$watch('field.value', validateCNPJ, true);
            break;
          case 'url':
            $scope.$watch('field.value', validateURL, true);
            break;
          case 'email':
            $scope.$watch('field.value', validateEmail, true);
            break;
          case 'date':
            $scope.$watch('field.value', validateDate, true);
            break;
        }

        if ($scope.field.requirements && $scope.field.requirements.maximum) {
          $scope.$watch('field.value', validateMaxLength, true);
        }

        if ($scope.field.requirements && $scope.field.requirements.minimum) {
          $scope.$watch('field.value', validateMinLength, true);
        }
      }
    };
  });
