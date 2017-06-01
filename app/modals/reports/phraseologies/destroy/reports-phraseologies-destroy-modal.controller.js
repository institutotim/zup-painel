(function (angular) {
  'use strict';

  angular
    .module('ReportsPhraseologiesDestroyModalModule', [
      'ReportsPhraseologiesServiceModule',
      'ReportsCategoriesServiceModule'
    ])
    .controller('ReportsPhraseologiesDestroyModalController', ReportsPhraseologiesDestroyModalController)
    .factory('ReportsPhraseologiesDestroyModalService', ReportsPhraseologiesDestroyModalService);

  ReportsPhraseologiesDestroyModalController.$inject = [
    '$scope',
    '$rootScope',
    '$modalInstance',
    'parentScope',
    'phraseology',
    'ReportsPhraseologiesService',
    'ReportsCategoriesService'
  ];
  function ReportsPhraseologiesDestroyModalController($scope, $rootScope, $modalInstance, parentScope, phraseology, ReportsPhraseologiesService, ReportsCategoriesService) {
    $scope.phraseology = phraseology;
    $scope.close = $modalInstance.close;
    $scope.confirm = confirm;

    function confirm() {
      var promise = ReportsPhraseologiesService.deletePhraseology($scope.phraseology);

      $scope.deleting = true;
      promise.then(function () {
        $scope.deleting = false;
        parentScope.getData();
        $scope.close();
      }, function () {
        $scope.deleting = false;
        $rootScope.showMessage('exclamation-sign', 'Erro ao remover padrão de resposta.', 'error', true);
        $scope.close();
      });
    }

    function _initialize() {
      var promise = ReportsCategoriesService.getCategoryById($scope.phraseology.reports_category_id, {
        return_fields: [ 'title' ]
      });
      promise.then(function (category) {
        $scope.phraseology.category = category;
      }, function () {
        $rootScope.showMessage('exclamation-sign', 'Erro ao recuperar categoria do padrão de resposta.', 'error', true);
        $scope.close();
      });
    }

    _initialize();
  }

  ReportsPhraseologiesDestroyModalService.$inject = ['$modal'];
  function ReportsPhraseologiesDestroyModalService($modal) {
    var self = {};

    self.open = open;

    function open(scope, phraseology) {
      return $modal.open({
        templateUrl: 'modals/reports/phraseologies/destroy/reports-phraseologies-destroy-modal.template.html',
        windowClass: 'phraseologiesDestroyModal',
        controller: 'ReportsPhraseologiesDestroyModalController',
        resolve: {
          parentScope: function () {
            return scope;
          },
          phraseology: function () {
            return phraseology;
          }
        }
      }).result;
    }

    return self;
  }

})(angular);
