'use strict';

angular
  .module('FormatErrorsHelperModule', [])
  .filter('formatErrors', function ($sce, $filter) {
    return function (errors) {
      var formattedErrors = [];

      for (var index in errors)
      {
        for (var i = 0; i < errors[index].length; i++) {
          var translatedIndex = $filter('translateErrors')(index);
          var capitalizedIndex = translatedIndex.charAt(0).toUpperCase() + translatedIndex.slice(1);

          formattedErrors.push(capitalizedIndex + ' ' + $filter('translateErrors')(errors[index][i]));
        }
      }

      return $sce.trustAsHtml(formattedErrors.join('<br>'));
    };
  });
