'use strict';

angular
  .module('AdvancedFiltersShapefileModalControllerModule', [])
  .controller('AdvancedFiltersShapefileModalController', function($scope, $rootScope, $modalInstance, activeAdvancedFilters, perimetersResponse, $log) {

    $rootScope.resolvingRequest = false;
    $scope.perimeters = [];
    $scope.activeAdvancedFilters = activeAdvancedFilters;
    $scope.search = {};
    var selectedShapefilesID = [];

    // TODO Simplify this when inventory perimeters get its own API Client service
    var perimeters = $scope.perimeters = _.map(perimetersResponse, function(value, key){ return value; });

    _.each($scope.activeAdvancedFilters, function(filter) {
      if(filter.type == 'shapefiles' && selectedShapefilesID.indexOf(filter.value) === -1)
      {
        selectedShapefilesID.push(filter.value);
      }
    });

    $scope.isActive = function(shapefile) {
      return selectedShapefilesID.indexOf(shapefile.id) !== -1;
    };

    $scope.updateShapefile = function(shapefile) {
      var index = selectedShapefilesID.indexOf(shapefile.id);

      if (index === -1)
      {
        selectedShapefilesID.push(shapefile.id);
      }
      else
      {
        selectedShapefilesID.splice(index, 1);
      }
    };

    $scope.save = function() {
      _.each(selectedShapefilesID, function(ID){
        var perimeter = _.where(perimeters, { 'id': ID })[0];

        if(!_.any($scope.activeAdvancedFilters, function(filter) { return filter.type == 'perimeters' && filter.value == perimeter.id; })) {
          var filter = {
            title: 'Perímetro de encaminhamento',
            type: 'shapefiles',
            desc: perimeter.title,
            value: perimeter.id
          };

          $scope.activeAdvancedFilters.push(filter);
        }
      });

      _.each($scope.activeAdvancedFilters, function(filter, index) {
        if(filter && filter.type == 'perimeters' && selectedShapefilesID.indexOf(filter.value) === -1)
        {
          $scope.activeAdvancedFilters.splice(index, 1);
        }
      });

      $modalInstance.close();
    };

    $scope.close = function() {
      $modalInstance.close();
    };
  });
