'use strict';

angular
  .module('ReportsCategoriesNotificationsLayoutControllerModule', ['ckeditor', 'angularLoad'])

  .controller('ReportsCategoriesNotificationsLayoutController', function ($scope, $rootScope, $timeout, $location, $anchorScroll, $modalInstance, $log, parentScope, notificationType, angularLoad, ENV) {

    $log.info('ReportsCategoriesNotificationsLayoutController created.');
    $scope.$on('$destroy', function () {
      $log.info('ReportsCategoriesNotificationsLayoutController destroyed.');
    });

    var originalLayout = angular.copy(notificationType.layout);

    $scope.notificationTypeOnLayoutModal = notificationType;

    $scope.loadingCkeditorScript = true;

    $log.info('ckeditorPath: ' + ENV.ckeditorPath);

    angularLoad.loadScript(ENV.ckeditorPath).then(function () {
      $scope.loadingCkeditorScript = false;
    });

    $scope.$on('$locationChangeStart', function (evt) {
      evt.preventDefault();
      $scope.closeLayoutNotificationTypeModal();
    });

    $scope.closeLayoutNotificationTypeModal = function () {
      if (!originalLayout && $scope.notificationTypeOnLayoutModal.layout.length === 0) {
        $modalInstance.close();
        return;
      }
      if (!angular.equals(originalLayout, $scope.notificationTypeOnLayoutModal.layout)) {
        if (window.confirm('Você tem certeza que deseja sair? Há alterações que não foram salvas.')) {
          $scope.notificationTypeOnLayoutModal.layout = angular.copy(originalLayout);
          $modalInstance.close();
        }
      } else {
        $modalInstance.close();
      }
    };

    $scope.saveLayoutNotificationType = function () {
      if (!angular.equals(originalLayout, $scope.notificationTypeOnLayoutModal.layout)) {
        parentScope.verifyDirtyNotificationTypeMemento(parentScope.notificationTypeOriginator);
      }
      $modalInstance.close();
    };

  });
