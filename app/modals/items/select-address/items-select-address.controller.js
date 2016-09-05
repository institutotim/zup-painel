(function (angular, _) {
  'use strict';

  angular
    .module('ItemsSelectAddressModalControllerModule', [
      'SelectLatLngMapComponent',
      'SearchLatLngMapComponent'
    ])

    .controller('ItemsSelectAddressModalController', function ($scope, $modalInstance, category, updating, itemData, locationFieldsIds) {
      $scope.updating = updating;
      $scope.category = category;

      $scope.latLng = [itemData[locationFieldsIds[0]], itemData[locationFieldsIds[1]]];

      $scope.close = function () {
        $modalInstance.close();
      };

      $scope.save = function () {

        itemData[locationFieldsIds[0]] = $scope.latLng[0];
        itemData[locationFieldsIds[1]] = $scope.latLng[1];
        itemData[locationFieldsIds[2]] = null;
        itemData[locationFieldsIds[3]] = null;
        itemData[locationFieldsIds[4]] = null;
        itemData[locationFieldsIds[5]] = null;
        itemData[locationFieldsIds[6]] = null;

        if (!_.isEmpty($scope.addressComponents)) {
          _.each($scope.addressComponents, function (component) {
            var type = component.types[0];

            // complete address
            if (type === 'route') {
              if (itemData[locationFieldsIds[2]] !== null) {
                itemData[locationFieldsIds[2]] = component.long_name + ', ' + itemData[locationFieldsIds[2]];
              } else {
                itemData[locationFieldsIds[2]] = component.long_name;
              }
            }

            // street number
            if (type === 'street_number') {
              if (itemData[locationFieldsIds[2]] !== null) {
                itemData[locationFieldsIds[2]] = itemData[locationFieldsIds[2]] + ', ' + component.long_name;
              } else {
                itemData[locationFieldsIds[2]] = component.long_name;
              }
            }

            // neighborhood
            if (_.contains(['sublocality_level_1', 'sublocality'], component.types[1])) {
              itemData[locationFieldsIds[4]] = component.long_name;
            }

            // city
            if (type === 'locality') {
              itemData[locationFieldsIds[5]] = component.long_name;
            }

            // state
            if (type === 'administrative_area_level_1') {
              itemData[locationFieldsIds[6]] = component.long_name;
            }

            // zip code
            if (_.contains(['postal_code', 'postal_code_prefix'], type)) {
              itemData[locationFieldsIds[3]] = component.long_name;
            }
          });
        }

        $modalInstance.close();
      };
    });
})(angular, _);
