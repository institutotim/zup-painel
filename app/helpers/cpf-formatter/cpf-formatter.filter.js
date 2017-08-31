(function (angular) {
  'use strict';

  angular
    .module('CpfFormatterHelperModule', [])
    .filter('cpf', CpfFormatterFilter);

  function CpfFormatterFilter() {
    var sub = function (str, begin, end) { return str.substring(begin, end); }
    return function (cpf) {
      return sub(cpf, 0, 3) + '.' +
             sub(cpf, 3, 6) + '.' +
             sub(cpf, 6, 9) + '-' +
             sub(cpf, 9, 11);
    };
  }
})(angular);
