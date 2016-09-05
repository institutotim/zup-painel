'use strict';

angular
  .module('NamespaceSelectorModule', ['AuthServiceModule', 'NamespacesServiceModule'])
  .directive('namespaceSelector', function (Auth, NamespacesService, NamespacesSelectorModalService) {
    return {
      restrict: 'E',
      templateUrl: 'components/namespace-selector/namespace-selector.template.html',
      controller: function NamespacesSelectorController($scope) {
        $scope.modalOpen = false;
        $scope.openNamespaceSelector = function () {
          $scope.modalOpen = true;
          NamespacesSelectorModalService.open();
        };
      }
    };
  })
  .controller('NamespacesSelectorController', function ($scope, Auth, $modalInstance, NamespacesService, $state) {
    $scope.close = function () {
      $modalInstance.dismiss();
    };

    NamespacesService.fetchAll().then(function (namespaces) {
      $scope.namespaces = namespaces;
      $scope.dataLoaded = true;
    });

    $scope.selectNamespace = function (namespace) {
      Auth.setCurrentNamespace(namespace);
      $scope.close();
      var currentPath = $state.href($state.current.name, $state.params);
      var listingURLForCurrentModule = currentPath.match(/([^\d]+)/)[1];
      if(listingURLForCurrentModule[0] != '/') {
        listingURLForCurrentModule = '/' + listingURLForCurrentModule;
      }

      if(listingURLForCurrentModule[listingURLForCurrentModule.length - 1] == '/') {
        listingURLForCurrentModule = listingURLForCurrentModule.substr(0, listingURLForCurrentModule.length - 1)
      }

      window.location = listingURLForCurrentModule;

      // In case the URL stays the same the browser won't reload the page
      $state.transitionTo($state.current, $state.params, {
        reload: true, inherit: false, notify: true
      });
    };

    $scope.modalOpen = true;

    $scope.dataLoaded = false;
  })
  .factory('NamespacesSelectorModalService', function ($modal) {
    return {
      open: function () {
        return $modal.open({
          templateUrl: 'components/namespace-selector/namespace-selector-modal.template.html',
          windowClass: 'namespacesListModal',
          controller: 'NamespacesSelectorController'
        });
      }
    };
  });

