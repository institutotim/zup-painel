;(function (angular) {
    'use strict';

    angular
        .module('ReportsFeatureFlagsServiceModule', [])
        .factory('ReportsFeatureFlagsService', ReportsFeatureFlagsService);

    ReportsFeatureFlagsService.$inject = ['Restangular'];

    function ReportsFeatureFlagsService (Restangular) {
        var self = this;

        self.getFeatureFlags = function () {
            return Restangular.all('feature_flags').getList();
        };

        self.convertFeaturesFlagsFrom = function (featureFlags) {
            var features = [];
            for (var i = 0; i < featureFlags.length; i++) {
                var feature = featureFlags[i];
                features.push({
                    id: feature.id,
                    name: feature.name.trim(),
                    enabled: 'enabled' === feature.status
                });
            }
            self.features = features;
            return self;
        };

        self.and = function () {
            return self;
        };

        self.addInto = function ($scope) {
            for (var i = 0; i < self.features.length; i++) {
                var feature = self.features[i];
                $scope[feature.name] = feature.enabled;
            }
            return $scope;
        };

        return self;
    }

})(angular);
