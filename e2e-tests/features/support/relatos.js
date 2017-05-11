var ReportForm = require('./form_relato');

function Reports() {
  this.editForm = new ReportForm();
}

Reports.prototype = {
  activeFilter: function () {
    //browser.driver not support focus and blur events on tests background
    //But we can set value that control show/hide of filter though focus and blur event

    var script = 'setTimeout(function(done){' +
      'var $s = angular.element(\'[ng-model="filterQuery"]\').scope(); ' +
      '$s.show_availableFilters = true; ' +
      '$s.$digest(); ' +
      'done(); ' +
      '}.bind({}, arguments[arguments.length - 1]), 800);';

    return browser.executeAsyncScript(script);
  },

  chooseFilter: function (filterName) {
    var input = element(by.model('filterQuery'));

    return this.activeFilter()
      .then(function () {
        return input.clear();
      }).then(function () {
        return input.sendKeys(filterName);
      }).then(function () {
        return this.availableFilters().element(by.css('a[ng-click]')).click();
      }.bind(this));
  },

  availableFilters: function () {
    return element(by.css('.availableFilters[ng-show]'));
  },

  fillFilter: function (model, query) {
    return element(by.css('.modal-dialog')).element(by.model(model)).sendKeys(query);
  },

  submitFilter: function () {
    return element(by.css('.modal-dialog')).element(by.css('button[ng-click="save()"]')).click();
  },

  reports: function () {
    return element.all(by.css('#reports-listing-table tbody tr'));
  },

  getAllItems: function (byColumn) {
    var selectorItems = byColumn ? ':nth-child(' + byColumn + ')' : ':not(:nth-child(2)):not(:nth-child(4)):not(.status_color):not(:last-child)';

    return element.all(by.css('#reports-listing-table tbody tr td' + selectorItems));
  },

  newReport: function () {
    return element(by.css('[href="#/reports/add"]')).click();
  },

  clickOnFilter: function () {
    return element.all(by.css('.availableFilters[ng-show] a[ng-click]')).first().click();
  },

  fillRequiredFieldsInEditForm: function () {
    var form = this.editForm;

    return form.fillCategory("fios e cabos")
      .then(form.fillAddress.bind(form, "R. Julieta vila jordanopolis", "167"))
      .then(form.linkUser.bind(form, "Leide Santos"));
  },
  applyFilter: function (filter, value) {
    var page = this;
    if (!Array.isArray(value)) {
      value = [{model: 'input.value', value: value}];
    }

    return page.chooseFilter(filter)
      .then(function () {
        return Promise.all(value.map(function (v) {
          return page.fillFilter(v.model, v.value);
        }))
      }).then(function () {
        return page.submitFilter();
      });
  },
  confirmProtocol: function () {
    return element(by.css('.removeModal .modal-body p:first-of-type b:first-of-type'));
  },

  confirmAddress: function () {
    return element(by.css('.removeModal .modal-body p:first-of-type b:nth-child(2)'));
  },

  getProtocol: function () {
    return element.all(by.css('#reports-listing-table tbody .column-protocol a')).get(0);
  },

  getAdress: function () {
    return element.all(by.css('#reports-listing-table tbody .column-address')).get(0);
  },

  getSuccessMsg: function () {
    return element(by.css('.message-status.success p'));
  },

  reportDeleteButton: function () {
    return element.all(by.css('a[ng-click="deleteReport(report)"]')).get(0).click();
  },

  closeButton: function () {
    return element.all(by.css('button[ng-click="close()"]')).get(0).click();
  },

  getPhrase: function () {
    return element(by.css('.removeModal .modal-body p:first-of-type'));
  },

  excludeIcon: function () {
    return element.all(by.css('a[ng-click="deleteReport(report)"]')).get(0).click();
  }
};

module.exports = Reports;
