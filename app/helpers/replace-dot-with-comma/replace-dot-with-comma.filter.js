'use strict';

angular
  .module('ReplaceDotWithCommaHelperModule', [])
  .filter('replaceDotWithComma', function () {
    return function (input) {
      if (typeof input === 'undefined')
      {
        return;
      }

      return input.replace('.', ',');
    };
  });
