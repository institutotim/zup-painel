/**
 * Created by Jairo on 19/07/2015.
 */
angular.module('DisplayNotificationDirectiveModule', ['ZupPrintDirectiveModule', 'ckeditor', 'angularLoad'])

  .directive('displayNotification', function ($modal) {
    return {
      restrict: 'A',
      scope: {
        displayNotification: '&'
      },
      link: function (scope, el, attrs) {
        var fncHandler = function (evt) {
          evt.preventDefault();
          $modal.open({
            backdrop: 'static',
            templateUrl: 'directives/display-notification/display-notification.template.html',
            windowClass: 'gallery-modal fade',
            resolve: {
              content: function () {
                return scope.displayNotification();
              }
            },
            controller: 'DisplayNotificationModalCtrl'
          });
        };

        el.on('click', fncHandler);
        scope.$on('$destroy', function () {
          el.off('click', fncHandler);
        });
      }
    }
  })
  .controller('DisplayNotificationModalCtrl', function ($scope, $rootScope, $modalInstance, ENV, content, angularLoad) {

    $scope.content = content;
    $scope.scriptLoaded = false;

    $scope.close = function () {
      $modalInstance.close();
    };

    angularLoad.loadScript(ENV.ckeditorPath).then(function () {
      $scope.scriptLoaded = true;
    });

    $scope.$on('$locationChangeStart', function (evt) {
      evt.preventDefault();
      $modalInstance.dismiss('locationChange');
    });
  });
