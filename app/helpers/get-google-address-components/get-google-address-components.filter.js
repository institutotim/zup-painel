'use strict';

angular
  .module('FilterGoogleAddressComponentsHelperModule', [])

  .filter('filterGoogleAddressComponents', function () {
    return function (addressComponentsObject) {
      var treatedComponents = {};

      _.each(addressComponentsObject, function(c) {

        // we go through each type
        _.each(c.types, function(type) {
          if (type === 'route') treatedComponents['address'] = c.long_name
          else if (type === 'sublocality_level_1') treatedComponents['neighborhood'] = c.long_name
          else if (type === 'sublocality') treatedComponents['neighborhood'] = c.long_name
          else if (type === 'locality') treatedComponents['city'] = c.long_name
          else if (type === 'administrative_area_level_1') treatedComponents['state'] = c.short_name
          else if (type === 'country') treatedComponents['country'] = c.long_name;
          else if (type === 'street_number') treatedComponents['number'] = c.long_name
          else if (type === 'postal_code_prefix') treatedComponents['zipcode'] = c.long_name
          else if (type === 'postal_code') treatedComponents['zipcode'] = c.long_name
        });
      });

      return treatedComponents;
    };
  });
