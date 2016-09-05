'use strict';

angular
  .module('NamespacesModalModule', [
    'NamespacesServiceModule'
  ])
  .controller('NamespacesModalModuleController', function ($scope, $modalInstance, NamespacesService, $timeout) {
    $scope.dataLoaded = false;

    $scope.namespace = {name: ''};

    var loadNamespaces = function () {
      NamespacesService.fetchAll().then(function (namespaces) {
        $scope.namespaces = namespaces;
        $scope.dataLoaded = true;
      });
    };

    loadNamespaces();

    $scope.submitNamespace = function () {
      $scope.isSaveRequestPending = true;
      $scope.saveNamespacePromise = NamespacesService.save($scope.namespace).then(function () {
        $scope.isSaveRequestPending = false;
        $scope.namespace = {name: ''};
        loadNamespaces();
      }, showFailedRequestMessage);
    };

    $scope.remove = function(namespace) {
      $scope.removeNamespacePromise = NamespacesService.remove(namespace.id).then(function(){
        var indexInList = $scope.namespaces.indexOf(namespace);
        $scope.namespaces.splice(indexInList, 1);
      }, showFailedRequestMessage);
    };

    $scope.saveNamespace = function (namespace) {
      namespace.isRequestPending = true;
      $scope.saveNamespacePromise = NamespacesService.save(namespace).then(function () {
        namespace.isRequestPending = false;
        loadNamespaces();
      }, showFailedRequestMessage);
    };

    $scope.close = function () {
      $modalInstance.dismiss();
    };

    function showFailedRequestMessage(response) {
      showErrorMessage('Um erro ocorreu durante a realização da ação solicitada. Por favor, tente novamente ou entre em contato com o suporte.');
      console.error('Namespace modal request error: ', response);
    }

    function showErrorMessage(errorMessage){
      $scope.namespaceError = errorMessage;

      $timeout(function () {
        delete $scope.namespaceError;
      }, 10000);
    }
  })
  .factory('NamespacesModalService', function ($modal) {
    return {
      open: function () {
        return $modal.open({
          templateUrl: 'routes/groups/index/components/namespaces.template.html',
          windowClass: 'namespacesModal',
          controller: 'NamespacesModalModuleController'
        });
      }
    };
  });
