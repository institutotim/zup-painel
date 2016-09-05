'use strict';

angular
  .module('MultipleSelectListComponentModule', [])

  .directive('multipleSelectList', function () {
    return {
      restrict: 'E',
      templateUrl: "components/multiple-select-list/multiple-select-list.template.html",
      transclude: true,
      scope: {
        ngModel: '=',
        singularObjectName: '@',
        pluralObjectName: '@'
      },
      replace: true,
      controller: function ($scope) {
        if (!_.isArray($scope.ngModel)) $scope.ngModel = [];

        $scope.selectAll = function (objects, key) {
          $scope.ngModel.length = 0;
          _.each(objects, function (object) {
            $scope.ngModel.push(object[key]);
          });
        };

        $scope.getExcerpt = function () {
          switch ($scope.ngModel.length) {
            case 0:
              return 'Selecione uma ' + (_.isUndefined($scope.singularObjectName) ? 'categoria' : $scope.singularObjectName);
            case 1:
              return '1 ' + (_.isUndefined($scope.singularObjectName) ? 'categoria' : $scope.singularObjectName) + ' selecionado';
            default:
              return $scope.ngModel.length + ' ' + (_.isUndefined($scope.pluralObjectName) ? 'categorias' : $scope.pluralObjectName) + ' selecionadas';
          }
        };

        $scope.toggle = function (indexOnObjects) {
          var i = $scope.ngModel.indexOf(indexOnObjects);

          if (i === -1) {
            $scope.ngModel.push(indexOnObjects);
          } else {
            $scope.ngModel.splice(i, 1);
          }
        };

        $scope.isSelected = function (indexOnObjects) {
          return $scope.ngModel.indexOf(indexOnObjects) !== -1;
        };
      }
    };
  });
