/*
 * CubesViewer
 * Copyright (c) 2012-2016 Jose Juan Montes, see AUTHORS for more details
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Adds support for datefilters.
 *
 * This module requires that the model is configured
 * to declare which dimensions may use a datefilter,
 * and which fields of the dimension correspond to
 * calendar fields (year, quarter, month, day, week...).
 * (see integrator documentation for more information).
 *
 */

"use strict";

angular.module('cv.views.cube').filter("datefilterMode", ['$rootScope', 'cvOptions',
  function ($rootScope, cvOptions) {
    return function (val) {
      var text = "None";
      switch (val) {
        case "custom":
          text = "Personalizado";
          break;
        case "auto-last1m":
          text = "Último mês";
          break;
        case "auto-last3m":
          text = "Últimos 3 meses";
          break;
        case "auto-last6m":
          text = "Últimos 6 meses";
          break;
        case "auto-last12m":
          text = "Último ano";
          break;
        case "auto-last24m":
          text = "Últimos 2 anos";
          break;
        case "auto-january1st":
          text = "Desde 1 de Janeiro";
          break;
        case "auto-yesterday":
          text = "Ontem";
          break;
      }
      return text;
    };
  }]);

angular.module('cv.views.cube').controller("CubesViewerViewsCubeFilterDateController", ['$rootScope', '$scope', '$filter', 'cvOptions', 'cubesService', 'viewsService', 'PeriodSelectorService',
  function ($rootScope, $scope, $filter, cvOptions, cubesService, viewsService, PeriodSelectorService) {
    $scope.initialize = function () {
      $scope.dateStart.value = $scope.datefilter.date_from ? new Date($scope.datefilter.date_from) : null;
      $scope.dateEnd.value = $scope.datefilter.date_to ? new Date($scope.datefilter.date_to) : null;
    };

    $scope.dateStart = {
      opened: false,
      value: null,
      options: {
        //dateDisabled: disabled,
        formatYear: 'yyyy',
        //maxDate: new Date(2020, 12, 31),
        //minDate: new Date(1970, 1, 1),
        startingDay: cvOptions.datepickerFirstDay,
        showWeeks: cvOptions.datepickerShowWeeks
      }
    };

    $scope.dateEnd = {
      opened: false,
      value: null,
      options: {
        //dateDisabled: disabled,
        formatYear: 'yyyy',
        //maxDate: new Date(2020, 12, 31),
        //minDate: new Date(1970, 1, 1),
        startingDay: cvOptions.datepickerFirstDay,
        showWeeks: cvOptions.datepickerShowWeeks
      }
    };

    $scope.dateStartOpen = function () {
      PeriodSelectorService.open(false, $scope.dateStart.value, $scope.dateEnd.value).then(function(period){
        $scope.dateStart = { value: moment(period.beginDate).startOf('day').format() };
        $scope.dateEnd = { value: moment(period.endDate).endOf('day').format() };
        $scope.updateDateFilter();
      });
    };

    $scope.setMode = function (mode) {
      $scope.datefilter.mode = mode;
    };

    $scope.updateDateFilter = function () {
      $scope.datefilter.date_from = $scope.dateStart.value;
      $scope.datefilter.date_to = $scope.dateEnd.value;
      $scope.refreshView();
    };

    $scope.$watch("dateStart.value", $scope.updateDateFilter);
    $scope.$watch("dateEnd.value", $scope.updateDateFilter);
    $scope.$watch("datefilter.mode", $scope.updateDateFilter);

    $scope.initialize();

  }]).directive('date', function (dateFilter) {
    return {
      require:'ngModel',
      
      link:function (scope, elm, attrs, ctrl) {
        var dateFormat = attrs['date'] || 'yyyy-MM-dd';
      
        console.log('Entrou');

        ctrl.$formatters.unshift(function (modelValue) {
          console.log(dateFilter(modelValue, dateFormat));
          return dateFilter(modelValue, dateFormat);
        });
      }
    };
});
