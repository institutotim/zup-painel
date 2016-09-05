'use strict';

angular
  .module('SelectListComponentModule', [])

  .directive('selectList', function ($document) {
    return {
        restrict: 'E',
        templateUrl: "components/select-list/select-list.template.html",
        transclude: true,
        scope: {
          ngModel: '=',
          optionName: '@',
          optionValue: '@',
          myPlaceHolder: '@',
          markDirty: '=',
          options: '='
        },
        replace: true,
        controller: function ($scope) {

          var setupDirty = function() {
            if(_.isUndefined($scope.markDirty.__dirty) || _.isNull($scope.markDirty.__dirty)){
              var dirtyArray = $scope.markDirty.__dirty = [];
              $scope.markDirty.__isDirty = function() {
                return _.indexOf(dirtyArray, true) > -1;
              };
              $scope.markDirty.__resetDirty = function() {
                for(var i = dirtyArray.length - 1; i >=0; i--){
                  dirtyArray[i] = false;
                }
                $scope.memento = angular.copy($scope.ngModel);
              }
            }
            $scope.dirtyIndex = $scope.markDirty.__dirty.length;
            $scope.markDirty.__dirty.push(false);
            $scope.memento = angular.copy($scope.ngModel);
          }

          if($scope.markDirty) {
            setupDirty();
          }

          $scope.getExcerpt = function() {
            if(_.isArray($scope.options)){
              if(_.isNull($scope.ngModel) || _.isUndefined($scope.ngModel)){
                return $scope.myPlaceHolder;
              }else{
                var value = _.find($scope.options,function(_value){
                  return _.isEqual(_value[$scope.optionValue],$scope.ngModel);
                });
                if(_.isNull(value) || _.isUndefined(value)){
                  return 'Opção não disponível';
                }else{
                  return value[$scope.optionName];
                }
              }
            } else {
              if ($scope.title)
              {
                return $scope.title;
              }

              if ($scope.myPlaceHolder) {
                return $scope.myPlaceHolder;
              }

              return 'Selecione uma categoria';
            }
          };

          $scope.select = function(optionId, option) {
            $scope.ngModel = optionId;

            if($scope.markDirty && _.isArray($scope.markDirty.__dirty)) {
              $scope.markDirty.__dirty[$scope.dirtyIndex] = !_.isEqual($scope.ngModel, $scope.memento);
            }

            $scope.title = option[$scope.optionName];

            $scope.show = false;
            $scope.$emit('optionSelected', option);
          };

          $scope.toggle = function (optionId, option) {
            if ($scope.isSelected(optionId)) {
              $scope.ngModel = null;
              $scope.show = false;
            } else {
              $scope.select(optionId, option);
            }
          };

          $scope.isSelected = function(optionId) {
            if (optionId === $scope.ngModel) return true;

            return false;
          };
        },
        link: function(scope, element) {
          var windowClick = function(event) {
            if (!$(event.target).closest(element).length) {
              scope.show = false;

              scope.$apply();

              angular.element($document).off('click', windowClick);
            }
          };

          scope.toggleList = function() {
            scope.show = !scope.show;

            if (!scope.show)
            {
              angular.element($document).off('click', windowClick);
            }
            else
            {
              // we need to hide the menu if clicked anywhere else
              angular.element($document).on('click', windowClick);
            }
          };

          // we still unbind the event on scope.$destroy JUST IN CASE
          scope.$on('$destroy', function () {
            angular.element($document).off('click', windowClick);
          });
        }
    };
  });
