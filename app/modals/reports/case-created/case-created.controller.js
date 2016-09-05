'use strict';

angular
  .module('caseCreatedModalModule', [])
  .controller('caseCreatedModalController', function ($modal, $scope, $modalInstance, $state, kase) {
    $scope.case = kase;

    $scope.close = function () {
      $modalInstance.close();
    };

    $scope.openCase = function () {
      $modalInstance.close();
      $state.go('cases.edit', { id: kase.id });
    };
  })
  .factory('caseCreatedModalService', function ($modal, $q) {
    return {
      open: function (kase) {
        var deferred = $q.defer();

        $modal.open({
          templateUrl: 'modals/reports/case-created/case-created.template.html',
          windowClass: 'caseCreatedModalController',
          resolve: {
            kase: function () {
              return kase;
            }
          },
          controller: 'caseCreatedModalController',
          controllerAs: 'caseCreatedModalCtrl'
        });

        return deferred.promise;
      }
    }
  });
