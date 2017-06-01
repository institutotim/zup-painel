(function (angular) {
  'use strict';

  angular
    .module('ReportsPhraseologiesControllerModule', [
      'ReportsPhraseologiesServiceModule',
      'ReportsPhraseologiesModalModule',
      'ReportsPhraseologiesDestroyModalModule'
    ])
    .controller('ReportsPhraseologiesController', ReportsPhraseologiesController);

  ReportsPhraseologiesController.$inject = [
    '$scope',
    'ReportsPhraseologiesService',
    'ReportsPhraseologiesModalService',
    'ReportsPhraseologiesDestroyModalService',
    '$log'
  ];
  function ReportsPhraseologiesController($scope, ReportsPhraseologiesService, ReportsPhraseologiesModalService, ReportsPhraseologiesDestroyModalService, $log) {

    $log.debug('ReportsPhraseologiesController created.');
    $scope.$on('$destroy', function () {
      $log.debug('ReportsPhraseologiesController destroyed.');
    });

    $scope.categories = [];

    $scope.getData = function () {
      if (!$scope.loading) {
        $scope.loading = true;

        var options = {};

        options.paginate = false;
        options.grouped = true;

        var promise = ReportsPhraseologiesService.fetchAll(options);

        $scope.total = 0;
        promise.then(function (categories) {
          $scope.categories = categories;

          _.each(categories, function (phraseologies) {
            $scope.total += _.size(phraseologies);
          });
        }, function () {
          $scope.loading = false;
          $rootScope.showMessage('exclamation-sign', 'Não foi possível atualizar a listagem.', 'error', false);
        });
      }
    };

    $scope.$on('phraseologiesFetched', function () {
      $scope.loading = false;
    });

    $scope.getData();

    $scope.addPhraseology = function () {
      ReportsPhraseologiesModalService.open($scope);
    };

    $scope.editPhraseology = function (phraseology) {
      var copy = angular.copy(phraseology);
      copy.reports_category_id = copy.reports_category_id || 'global';
      ReportsPhraseologiesModalService.open($scope, copy);
    };

    $scope.deletePhraseology = function (phraseology) {
      ReportsPhraseologiesDestroyModalService.open($scope, phraseology);
    }
  }

})(angular);
