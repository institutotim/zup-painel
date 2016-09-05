'use strict';

angular
  .module('PeriodSelectorModule', [])
  .controller('PeriodSelectorController', function($scope, $modalInstance, promise, openEnded) {
    $scope.openEnded = openEnded;
    $scope.period = {beginDate: new Date(), endDate: new Date(), tab: 'between'};

    $scope.save = function() {
      var returnBeginDate = false, returnEndDate = false;

      if ($scope.period.tab === 'between' || $scope.period.tab === 'from')
      {
        returnBeginDate = true;
        $scope.period.beginDate = moment($scope.period.beginDate).startOf('day').toDate();
      }

      if ($scope.period.tab === 'between' || $scope.period.tab === 'to')
      {
        returnEndDate = true;
        $scope.period.endDate = moment($scope.period.endDate).startOf('day').toDate();
      }

      if(returnBeginDate && returnEndDate) {
        promise.resolve($scope.period);
      } else if(returnBeginDate) {
        promise.resolve({ beginDate: $scope.period.beginDate });
      } else if(returnEndDate) {
        promise.resolve({ endDate: $scope.period.endDate });
      }

      $modalInstance.close();
    };

    $scope.validRange = function(){
      if(!openEnded || $scope.period.tab == 'between')
        return $scope.period.beginDate <= $scope.period.endDate;
      return true;
    };

    $scope.close = function() {
      promise.reject();
      $modalInstance.close();
    };
  })
  .factory('PeriodSelectorService', function ($modal, $q) {
    return {
      open: function (openEnded) {
        var deferred = $q.defer();

        $modal.open({
          templateUrl: 'components/period-selector/period-selector.template.html',
          windowClass: 'periodSelectorModal',
          resolve: {
            promise: function () {
              return deferred;
            },

            openEnded: function(){
              return openEnded;
            }
          },
          controller: 'PeriodSelectorController'
        });

        return deferred.promise;
      }
    }
  });
