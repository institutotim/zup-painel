'use strict';

angular
  .module('ReportsPrintModalControllerModule', [])

  .controller('ReportsPrintModalController', function($scope, $modalInstance, openModal) {
    $scope.selectedSections = [];

    $scope.sections = [
      { name: 'Dados do relato', key: 'fields' },
      { name: 'Fotos do relato', key: 'images' },
      { name: 'Mapa com localização do relato', key: 'map' },
      { name: 'Informações do solicitante', key: 'user' },
      { name: 'Respostas ao solicitante', key: 'replies' },
      { name: 'Observações internas', key: 'comments' },
      { name: 'Histórico do relato', key: 'history' },
      { name: 'Feedback do usuário', key: 'feedback' }
    ];

    $scope.toggleAll = function() {
      if ($scope.allSelected())
      {
        $scope.selectedSections = [];

        return;
      }

      _.each($scope.sections, function(section) {
        if (!$scope.isActive(section))
        {
          $scope.selectedSections.push(section.key);
        }
      });
    };

    $scope.allSelected = function() {
      return $scope.sections.length === $scope.selectedSections.length;
    };

    $scope.isActive = function(section) {
      return $scope.selectedSections.indexOf(section.key) !== -1;
    };

    $scope.toggle = function(section) {
      var index = $scope.selectedSections.indexOf(section.key);

      if (index === -1)
      {
        $scope.selectedSections.push(section.key);
      }
      else
      {
        $scope.selectedSections.splice(index, 1);
      }
    };

    $scope.confirm = function() {
      openModal($scope.selectedSections);

      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
