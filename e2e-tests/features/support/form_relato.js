var path  = require('path');

function Form() {}

Form.prototype = {
  fillCategory: function (categoryName) {
    var select = element(by.model('selectedCategory'));
    var dropdown = select.element(by.css('.dropdown'));
    var category = element(by.repeater('category in $parent.$parent.categories').row(0));

    return select.element(by.tagName('button')).click().then(function () {
      return dropdown.element(by.model('q')).sendKeys(categoryName).then(function () {
        return category.click();
      });
    });
  },

  fillAddress: function (street, num) {
    var k = protractor.Key;

    var getField = function (name) {
      var form = element(by.css('[ng-show="selectedCategory"]'));
      return form.element(by.model('address.' + name));
    }
    var typeInAddress = function (text) {
      return getField('address').sendKeys(text);
    };
    var whenAllAddressFieldsAreFilled = function(){
      return Promise.all([
        getField('district').getAttribute('value'),
        getField('postal_code').getAttribute('value'),
        getField('city').getAttribute('value'),
        getField('state').getAttribute('value'),
        getField('country').getAttribute('value')
      ]).then(function(values){
        return values.every(function(item){ return  !!item; });
      });
    };

    return typeInAddress(street).then(function () {
        return typeInAddress(k.ARROW_DOWN);
      }).then(function(){
        return typeInAddress(k.ENTER)
      }).then(function(){
        return browser.wait(whenAllAddressFieldsAreFilled, 5000);
      }).then(function(){
        return getField('number').sendKeys(num);
      });
  },

  linkUser: function (userName) {
    var linkOpenModal = element(by.css('button[ng-click="selectUser()"]'));
    var modal = element(by.css('.modal-reports-select-user'));
    var searchUsers = modal.element(by.css('input[keyboard-poster="search"]'));
    var firstUser = modal.element(by.repeater('user in users').row(0));
    var select = firstUser.element(by.css('button[ng-click="setUser(user)"]'));

    return linkOpenModal.click().then(function () {
      return modal.isDisplayed().then(function () {
        return searchUsers.sendKeys(userName).then(function () {
          browser.wait(function () {
            return firstUser.isDisplayed();
          }, 9000);
          return select.click();
        });
      });
    });
  },

  uploadImage : function () {
    var fileToUpload = '../../assets/images/9666941.png';
    var absolutePath = path.resolve(__dirname, fileToUpload);

    return element(by.css('.upload input[type="file"]')).sendKeys(absolutePath);
  },

  saveReport:function(){
    var EC = protractor.ExpectedConditions;
    var button = element(By.css('button[ng-click="send()"]'));
    browser.wait(EC.presenceOf(button), 10000).then(function () {
      return button.click();
    });
  },

  abaIsDisplayed : function(texto){
    var menu = element(by.css('.report-menu'));
    var aba = menu.element(by.linkText(texto));

    return aba.isPresent().then(function(present){
      return present && aba.isDisplayed();
    });
  },

  imageAreaIsDisplayed:function(){
    return element(by.id('report-images')).isDisplayed();
  }
};

module.exports = Form;
