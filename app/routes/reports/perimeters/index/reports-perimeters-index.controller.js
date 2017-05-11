(function (angular, _) {
  'use strict';

  angular
    .module('ReportsPerimetersIndexControllerModule', [
      'angularInlineEdit',
      'ReportsPerimetersServiceModule',
      'ReportsPerimetersModalControllerModule',
      'angular-toArrayFilter',
      'ReportsEditPerimeterModalControllerModule'
    ])
    .controller('ReportsPerimetersIndexController', ReportsPerimetersIndexController);

  ReportsPerimetersIndexController.$inject = [
    '$scope',
    '$rootScope',
    '$q',
    '$log',
    'ReportsPerimetersService',
    'ReportsEditPerimeterModalService',
    '$modal'
  ];
  function ReportsPerimetersIndexController($scope, $rootScope, $q, $log, ReportsPerimetersService, ReportsEditPerimeterModalService, $modal) {

    $log.debug('ReportsPerimetersIndexController created.');
    $scope.$on('$destroy', function () {
      $log.debug('ReportsPerimetersIndexController destroyed.');
    });

    var service = ReportsPerimetersService;

    $scope.loading = false;

    $scope.loadingPerimeter = {};

    $scope.statusDecorator = {
      pendent: ['time', 'perimeter-status-process', 'Em processamento'],
      imported: ['ok', 'perimeter-status-ok', 'Cadastrado com sucesso'],
      invalid_file: ['warning-sign', 'perimeter-status-error', 'Erro: Arquivo inválido'],
      out_of_bounds: ['warning-sign', 'perimeter-status-error', 'Erro: Fora do perímetro da cidade'],
      invalid_quantity: ['warning-sign', 'perimeter-status-error', 'Erro: Quantidade inválida'],
      invalid_geometry: ['warning-sign', 'perimeter-status-error', 'Erro: Forme geométrica inválida'],
      true: ['', 'perimeter-status-ok', 'Ativo'],
      false: ['', 'perimeter-status-process', 'Inativo']
    };

    $scope.perimeters = [];

    var cleanCache = $scope.cleanCache = function () {
      page = 1;
      perPage = 15;
      service.cleanCache();
    };

    $scope.sort = {
      'column': 'created_at',
      'descending': true
    };

    var page = 1, perPage = 15;

    $scope.changeTitleTerm = function () {
      cleanCache();
      getData();
    };

    var getData = $scope.getData = function () {
      if ($scope.loading === false) {
        $scope.loading = true;

        var options = {};

        if ($scope.sort.column !== '') {
          options.sort = $scope.sort.column;
          options.order = $scope.sort.descending ? 'desc' : 'asc';
        }

        options.paginate = true;
        options.page = +page || 1;
        options.per_page = +perPage || 15;
        options.title = _.isEmpty($scope.titleTerm) ? null : $scope.titleTerm;

        var promise = service.fetchAll(options);

        promise.then(function (perimeters) {
          page++;
          $scope.perimeters = perimeters;

          var lastPage = Math.ceil($scope.total / perPage);

          if (page === (lastPage + 1)) {
            $scope.loading = null;
          } else {
            $scope.loading = false;
          }

          $scope.loading = false;
        }, function () {
          $scope.loading = false;
          $rootScope.showMessage('exclamation-sign', 'Não foi possível atualizar a listagem.', 'error', false);
        });

        return promise;
      }
    };

    $scope.$on('perimetersFetched', function () {
      $scope.total = service.total;
      $scope.loading = false;
    });

    getData();

    $scope.updatePerimeter = function (perimeter, newValue) {
      perimeter.title = newValue;
      $scope.loadingPerimeter[perimeter.id] = true;
      service.updatePerimeter({id: perimeter.id, title: perimeter.title}).then(function () {
        $scope.loadingPerimeter[perimeter.id] = false;
        $rootScope.showMessage('ok', 'Nome do perímetro atualizado com sucesso.', 'success', true);
        $log.debug('Updated title');
      });
    };

    $scope.addPerimeter = function () {
      $modal.open({
        templateUrl: 'modals/reports/perimeters/reports-perimeters-modal.template.html',
        backdrop: false,
        resolve: {
          parentScope: function () {
            return $scope;
          }
        },
        controller: 'ReportsPerimetersModalController'
      });
    };

    $scope.deletePerimeter = function (perimeter) {
      $scope.deletePromise = service.deletePerimeter(perimeter).then(function () {
        delete $scope.perimeters[perimeter.id];
        $rootScope.showMessage('ok', 'Perímetro removido com sucesso.', 'success', true);
        $scope.deletePromise = null;
      }, function () {
        $rootScope.showMessage('exclamation-sign', 'Não foi possível remover o perímetro.', 'error', true);
        $scope.deletePromise = null;
      });
    };

    $scope.openEditModal = function (perimeter) {
      ReportsEditPerimeterModalService.open(perimeter)
        .then($q.when($scope.cleanCache()))
        .then(getData);
    };
  }

})(angular, _);
