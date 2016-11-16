'use strict';

angular
  .module('CasesIndexControllerModule', [
      'CasesServiceModule',
      'FlowsServiceModule',
      'CasesInactiveModalModule'
    ])

  .controller('CasesIndexController', function ($state, $scope, $rootScope, CasesService, FlowsService, CasesInactiveModalService, $q, $location, $timeout) {
    $scope.currentTab = 'my-cases';

    var page = 1, perPage = 30, total, lastPage;

    $scope.cases = [];
    $scope.flows = [];
    $scope.resolution_states = [];

    // sorting the tables
    $scope.sortTables = {
      progress: { column: 'updated_at', descending: true },
      'my-cases': { column: 'updated_at', descending: true },
      finished: { column: 'updated_at', descending: true }
    };

    $scope.filters = {
      flows: [],
      steps: [],
      resolution_states: []
    };

    $scope.querySearch = {
      finished: '',
      progress: ''
    };

    function initialize() {
      // get required data to start loading page
      $scope.loading = true;
      $scope.loadingPagination = false;

      getRequiredData().then(function() {
        $scope.loading = false;
      });
    }

    var getCases = function() {
      var options = {
        'page': page,
        'per_page': perPage,
        'completed': false
      };

      // check if we have categories selected
      if ($scope.filters.flows.length !== 0) {
        options.initial_flow_id = $scope.filters.flows.join(); // jshint ignore:line
      }

      // check if we have steps selected
      if ($scope.filters.steps.length !== 0) {
        options.step_id = $scope.filters.steps.join(); // jshint ignore:line
      }

      // check if we have resolution states selected
      if ($scope.filters.resolution_states.length !== 0) {
        options.resolution_state_id = $scope.filters.resolution_states.join(); // jshint ignore:line
      }

      if ($scope.currentTab === 'finished') {
        options.completed = true;
      }

      if ($scope.currentTab === 'my-cases') {
        options.mine = true;
        options.completed = false;
      }

      var query = $scope.querySearch[$scope.currentTab] || '';
      if (query.length > 0) {
        options.query = query;
      }

      var sortOptions = $scope.sortTables[$scope.currentTab];
      if (sortOptions) {
        options.sort = sortOptions.column;
        options.order = sortOptions.descending ? 'desc' : 'asc';
      }

      return CasesService.fetchAll(options);
    };

    var getFlows = function() {
      var options = {
        'initial': 'true',
        'return_fields': [
          'id', 'title', 'steps.id', 'steps.title',
          'resolution_states.id', 'resolution_states.title'
        ].join()
      };

      return FlowsService.fetchAll(options);
    };

    var getRequiredData = function() {
      var flowsPromise = getFlows();
      var casesPromise = getCases();

      var promise = $q.all([casesPromise, flowsPromise]);

      promise.then(function(responses) {
        $scope.flows = responses[1];
        $scope.cases = responses[0].cases;
        $scope.cases_keys = Object.keys($scope.cases[0].custom_fields);

        total = parseInt(responses[0].headers().total);
        lastPage = Math.ceil(total / perPage);

        $scope.steps = [];
        $scope.resolution_states = [];

        angular.forEach($scope.flows, function(flow) {
          $scope.steps = $scope.steps.concat(flow.steps);
          $scope.resolution_states = $scope.resolution_states.concat(flow.resolution_states);
        });

        angular.forEach($scope.cases, function(kase) {
          kase.steps_complete = (kase.total_steps - kase.steps_not_fulfilled.length);
          angular.forEach(kase.steps, function(step, key) {
            if (step.step.id == kase.next_step_id) {
              kase.next_step = key + 1;
              return;
            }
          });
        });
      });

      return promise;
    };

    $scope.$watchCollection('[currentTab, filters.flows, filters.steps, filters.resolution_states]', function(newValue, oldValue) {
      if (angular.equals(newValue, oldValue) === false) {
        $scope.reload();
      }
    });

    // Search Watcher
    var searchTimeout;
    $scope.$watchCollection('[querySearch.progress, querySearch.finished]', function (newValue, oldValue) {
      if (searchTimeout) {
        $timeout.cancel(searchTimeout);
      }

      searchTimeout = $timeout(function () {
        if (angular.equals(newValue, oldValue) === false) {
          $scope.reload();
        }
      }, 1000);
    });

    $scope.paginate = function() {
      var deferred = $q.defer();

      if (page <= lastPage && $scope.loadingPagination === false) {
        $scope.loadingPagination = true;

        var casesPromise = getCases();

        casesPromise.then(function(response) {
          // we add our results to $scope.cases
          angular.forEach(response.cases, function(kase) {
            kase.steps_complete = (kase.total_steps - kase.steps_not_fulfilled.length);
            $scope.cases.push(kase);

            angular.forEach(kase.steps, function(step, key) {
              if (step.step.id == kase.next_step_id) {
                kase.next_step = key + 1;
                return;
              }
            });
          });

          // add up one page
          page++;

          // hide pagination loader
          $scope.loadingPagination = false;
          deferred.resolve();
        }, function(){
          deferred.resolve();
        });
      } else {
        // (loadingPagination === null) means all items were loaded
        $scope.loadingPagination = null;
        deferred.resolve();
      }

      return deferred.promise;
    };

    $scope.reload = function() {
      $scope.cases = [];
      $scope.loadingPagination = false;
      $scope.loadingContent = true;
      page = 1;

      getRequiredData().then(function() {
        $scope.loadingContent = false;
      });
    };

    $scope.changeSorting = function(column) {
      var sort = $scope.sortTables[$scope.currentTab];

      if (sort.column === column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }

      $scope.reload();
    };

    $scope.selectedCls = function(column) {
      if(!$scope.sortTables[column]) {
        return;
      }
      var sort = $scope.sortTables[$scope.currentTab];
      return column === sort.column && 'sort-' + sort.descending;
    };

    $scope.inactiveCase = function(kase) {
      CasesInactiveModalService
        .open(kase)
        .then(function() {
          $scope.cases.splice($scope.cases.indexOf(kase), 1);
        });
    };

    $scope.restoreCase = function(kase) {
      var promise = CasesService.restore(kase);

      kase.loading = true;
      promise.then(function() {
        kase.status = 'active';
        kase.loading = false;

        $scope.cases.splice($scope.cases.indexOf(kase), 1);

        $scope.showMessage('ok', 'O caso foi restaurado com sucesso.', 'success', false);
      });
    };

    $scope.openCase = function(kase, event) {
      if(!$rootScope.loading
        && event.target.parentNode.tagName.toLowerCase() != 'a'
        && event.target.tagName.toLowerCase() != 'a'
      ) {
        $state.go('cases.edit', { id: kase.id });
      }
    };

    initialize();
  });
