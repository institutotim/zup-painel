var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

module.exports = function () {

  var buttonConfirm = element.all(by.css('button[ng-click="confirm()"]')).get(0);
  var reportNumber;
  var address;
  var oldHtml;
  var thisPage;

  var confirmationText = function (txt) {
    return element(by.model('confirmText')).sendKeys(txt)
  };

  var actionClick = function () {
    thisPage = this.pages.report;
    oldHtml  = this.getInnerHtmlState('#reports-listing-table');

    return thisPage.reportDeleteButton();
  };
  this.World = require('../support/world').World;

  this.When(/^clicar no ícone de exclusão$/, actionClick);

  this.When(/^aparecer a confirmação de exclusão$/, function () {
    var confirmText = element(by.model('confirmText'));

    return browser.wait(function () {
      return confirmText.isPresent();
    }, 2000).then(function(){
      return expect(confirmText.isDisplayed()).to.eventually.be.true;
    });
    
  });

  this.When(/^digito a palavra deletar$/, function () {
    return confirmationText('deletar');
  });

  this.When(/^clicar no botão remover$/, function () {
    return buttonConfirm.click()
  });

  this.Then(/^o sistema deve retornar uma mensagem de remoção bem sucedida$/, function () {
    return expect(thisPage.getSuccessMsg().isPresent()).to.eventually.be.true
  });

  this.Then(/^atualizar a listagem de relatos$/, function () {
    return expect(element(by.css('#reports-listing-table')).getInnerHtml()).to.not.equal(oldHtml);
  });

  this.When(/^digito qualquer palavra que não seja deletar$/, function () {
    return confirmationText('I\'m alive');
  });

  this.Then(/^o sistema não deve ativar o botão remover$/, function () {
    return expect(buttonConfirm.isEnabled()).to.eventually.be.false.then(function () {
      return thisPage.closeButton();
    })
  });

  this.Given(/^escolho o relato com protocolo \#(\d+)$/, function () {
     return thisPage.getProtocol().getText().then(function(thisText) {
       reportNumber = '#' + thisText;
      });
  });

  this.When(/^clicar no ícone de exclusão deste relato$/, function () {
    return thisPage.excludeIcon();
  });

  this.When(/^leio a fraseologia de atenção$/, function () {
    return expect(thisPage.getPhrase().getInnerHtml()).to.not.empty;
  });

  this.Then(/^confirmo que a fraseologia cita o protocolo \#(\d+)$/, function () {
    return expect(thisPage.confirmProtocol().getText()).to.eventually.equal(reportNumber).then(function () {
      return confirmationText('deletar');
    }).then(function () {
      return buttonConfirm.click();
    });
  });

  this.Given(/^escolho o relato com protocolo localizado na R\. Leonel Guarnieri$/, function () {
     return thisPage.getAdress().getText().then(function (thisText) {
       address = thisText;
    });
  });

  this.Then(/^confirmo que a fraseologia cita o endereço R\. Leonel Guarnieri$/, function () {
    return expect(thisPage.confirmAddress().getText()).to.eventually.equal(address).then(function () {
      return confirmationText('deletar');
    }).then(function () {
      return buttonConfirm.click();
    });
  });
};
