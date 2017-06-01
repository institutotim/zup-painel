(function (angular) {
  'use strict';

  angular
    .module('ReportsPhraseologiesModalModule', [
      'ReportsPhraseologiesServiceModule',
      'ReportsCategoriesServiceModule'
    ])
    .controller('ReportsPhraseologiesModalController', ReportsPhraseologiesModalController)
    .factory('ReportsPhraseologiesModalService', ReportsPhraseologiesModalService);

  ReportsPhraseologiesModalController.$inject = [
    '$scope',
    '$rootScope',
    '$modalInstance',
    'parentScope',
    'phraseology',
    'ReportsPhraseologiesService',
    'ReportsCategoriesService'
  ];
  function ReportsPhraseologiesModalController($scope, $rootScope, $modalInstance, parentScope, phraseology, ReportsPhraseologiesService, ReportsCategoriesService) {
    $scope.close = $modalInstance.close;
    $scope.categories = [];
    $scope.phraseology = phraseology || {};
    $scope.isReadyToSave = isReadyToSave;
    $scope.save = save;

    function isReadyToSave() {
      return $scope.phraseology
        && $scope.phraseology.category
        && ($scope.phraseology.title && $scope.phraseology.title.length > 0 && $scope.phraseology.title.length <= 255)
        && ($scope.phraseology.description && $scope.phraseology.description.length > 0)
    }

    function save(reopen) {
      parentScope.loading = true;

      if ($scope.phraseology.category.id === 'global') {
        $scope.phraseology.reports_category_id = null;
      } else {
        $scope.phraseology.reports_category_id = $scope.phraseology.category.id;
      }

      var isUpdate = !!$scope.phraseology.id;

      var fn = isUpdate ? ReportsPhraseologiesService.updatePhraseology : ReportsPhraseologiesService.addPhraseology,
        smessage = isUpdate ? 'Resposta atualizada com sucesso.' : 'Resposta adicionada com sucesso.',
        emessage = isUpdate ? 'Não foi possível atualizar a resposta.' : 'Não foi possível adicionar a resposta.';

      fn($scope.phraseology)
        .then(function () {
          parentScope.loading = false;
          $rootScope.showMessage('ok', smessage, 'success', true);
          $scope.phraseology = {};
          parentScope.getData();
          if (!reopen) {
            $scope.close();
          }
        }, function () {
          parentScope.loading = false;
          $rootScope.showMessage('exclamation-sign', emessage, 'error', true);
        });
    }

    function _initialize() {
      var promise = ReportsCategoriesService.fetchTitlesAndIds();
      promise.then(function (categories) {
        $scope.categories = [];
        $scope.categories.push({
          id: 'global',
          title: 'Global'
        });
        $scope.categories = $scope.categories.concat(categories);
        $scope.phraseology.category = _findCategory($scope.phraseology.reports_category_id);
      }, function () {
        $rootScope.showMessage('exclamation-sign', 'Erro ao recuperar categorias.', 'error', true);
        $scope.close();
      });
    }

    function _findCategory(id) {
      for (var i = 0, len = $scope.categories.length; i < len; i++) {
        var cat = $scope.categories[i];
        if (cat.id === id) {
          return cat;
        }

        if (cat.subcategories) {
          for (var s = 0, slen = cat.subcategories.length; s < slen; s++) {
            var scat = cat.subcategories[s];
            if (scat.id === id) {
              return scat;
            }
          }
        }
      }
      return null;
    }

    _initialize();
  }

  ReportsPhraseologiesModalService.$inject = ['$modal'];
  function ReportsPhraseologiesModalService($modal) {
    var self = {};

    self.open = open;

    function open(scope, phraseology) {
      return $modal.open({
        templateUrl: 'modals/reports/phraseologies/reports-phraseologies-modal.template.html',
        windowClass: 'phraseologiesModal',
        controller: 'ReportsPhraseologiesModalController',
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
