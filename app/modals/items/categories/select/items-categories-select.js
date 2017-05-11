(function (angular) {
  'use strict';

  angular
    .module('ItemsCategoriesSelectModalModule', [
      'InventoriesCategoriesServiceModule'
    ])
    .factory('ItemsCategoriesSelectModalService', ItemsCategoriesSelectModalService);

  ItemsCategoriesSelectModalService.$inject = [
    '$modal'
  ];
  function ItemsCategoriesSelectModalService($modal) {
    var self = {};
    self.open = open;

    return self;

    function open() {
      return $modal.open({
        templateUrl: 'modals/items/categories/select/items-categories-select.template.html',
        controller: ItemsCategoriesSelectModalController,
        controllerAs: '$modal'
      }).result;
    }
  }

  ItemsCategoriesSelectModalController.$inject = [
    '$modalInstance', 'InventoriesCategoriesService'
  ];
  function ItemsCategoriesSelectModalController($modalInstance, InventoriesCategoriesService) {
    var vm = this;

    vm.category = undefined;
    vm.categories = [];
    vm.confirm = confirm;
    vm.close   = close;

    function initialize() {
      InventoriesCategoriesService
        .fetchAllBasicInfo()
        .then(function (response) {
          vm.categories = response.data.categories;
        });
    }

    function confirm(category) {
      $modalInstance.close(category);
    }

    function close() {
      $modalInstance.dismiss();
    }

    initialize();
  }
})(angular);
