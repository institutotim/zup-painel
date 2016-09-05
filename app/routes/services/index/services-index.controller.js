/*global angular*/
'use strict';

angular
  .module('ServicesIndexControllerModule', [
    'KeyboardPosterComponentModule',
    'GenericInputComponentModule',
    'ServicesDisableModalControllerModule'
  ])

  .controller('ServicesIndexController', function ($scope, $q, $stateParams, Restangular, ServicesDisableModalService) {
    $scope.loading = true;
    $scope.loadingPagination = false;

    var page = 1, perPage = 30, total, searchText = '';

    // sorting the tables
    $scope.sort = {
      column: 'name',
      descending: true
    };

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;

      if (sort.column === column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }

      // ReportsItemsService.resetCache();
      refresh();
    };

    $scope.selectedCls = function (column) {
      return column === $scope.sort.column && 'sort-' + $scope.sort.descending;
    };

    // Return right promise
    var generateServicesPromise = function () {
      var options = {
        page: page,
        per_page: perPage,
        disabled: true,
        'return_fields': 'id,name,disabled,email,token',
        sort: $scope.sort
      };

      if (searchText.length !== 0) {
        options.name = searchText;
      }

      return Restangular.all('services').getList(options);
    };

    // One every change of page or search, we create generate a new request based on current values
    var getData = $scope.getData = function (paginate) {
      if ($scope.loadingPagination === false) {
        $scope.loadingPagination = true;

        var servicesPromise = generateServicesPromise();

        servicesPromise.then(function (response) {
          if (paginate !== true) {
            $scope.services = response.data;
          } else {
            if (typeof $scope.services === 'undefined') {
              $scope.services = [];
            }

            for (var i = 0; i < response.data.length; i++) {
              $scope.services.push(response.data[i]);
            }

            // add up one page
            page++;
          }

          total = parseInt(response.headers().total);

          var lastPage = Math.ceil(total / perPage);

          if (page === (lastPage + 1)) {
            $scope.loadingPagination = null;
          } else {
            $scope.loadingPagination = false;
          }

          $scope.loading = false;
        });

        return servicesPromise;
      }
    };

    var refresh = function () {
      page = 1;

      $scope.loadingPagination = false;
      $scope.loadingSearch = true;
      $scope.services = [];

      getData(false).then(function () {
        $scope.loadingSearch = false;

        page++;
      });
    };

    // Search function
    $scope.search = function (text) {
      searchText = text;

      // reset pagination
      refresh();
    };

    $scope.disableService = function (service) {
      ServicesDisableModalService.open(service);
    };

    $scope.enableService = function (service) {
      service.loading = true;

      var enableServicePromise = Restangular.one('services', service.id).customPUT({}, 'enable');

      enableServicePromise.then(function () {
        service.disabled = false;
        service.loading = false;

        $scope.showMessage('ok', 'A aplicação ' + service.name + ' foi ativada com sucesso.', 'success', false);
      });
    };
  });
