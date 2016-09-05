var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-string'));
var expect = chai.expect;

module.exports = function () {
  var page;
  var $SEARCH_TERM;

  var getTerm = function () {
    return page.getAllItems(2).first().getText().then(function (thisTxt) {
      $SEARCH_TERM = thisTxt;
    });
  };

  var hasReports = function () {
    browser.wait(function () {
      return page.reports().isDisplayed();
    }, 5000);

    page = this.pages.report;
    return Promise.all([
      expect(element(by.css('#reports-listing-table')).isPresent()).to.eventually.be.ok,
      expect(page.reports().count()).to.eventually.greaterThan(0)
    ]);
  };

  var goToReports = function () {
    page = this.pages.report;
    return this.visit('/#/reports');
  };

  var checkCols = function () {
    return browser.wait(function () {
      return page.reports().count();
    }, 5000).then(function () {
      return page.getAllItems().map(function (coluna) {
        return expect(coluna.getText()).to.eventually.not.be.empty;
      });
    });
  };

  this.World = require('../support/world').World;

  this.Given(/^que estou na tela de relatos$/, goToReports);
  this.Given(/^que estou na listagem de relatos$/, goToReports);
  this.Given(/^que eu estou na listagem de relatos$/, goToReports);

  this.Given(/^que existem relatos cadastrados$/, hasReports);
  this.Given(/^que estou visualizando todos os relatos$/, hasReports);

  this.Then(/^todas colunas devem estar devidamente preenchidas$/, checkCols);

  this.Given(/^clico no campo para filtrar items$/, function () {
    return page.activeFilter().then(function () {
      return expect(page.availableFilters().isDisplayed()).to.eventually.ok;
    });
  });

  this.When(/^escolho um filtro$/, function () {
    return page.clickOnFilter();
  });

  this.When(/^preencho todos dados necessarios para realizar a busca$/, function () {
    return getTerm().then(function () {
      return page.fillFilter('input.query', $SEARCH_TERM);
    });
  });

  this.When(/^clico no botão criar filtro$/, function () {
    return page.submitFilter();
  });

  this.Then(/^devo visualizar somente os relatos que contem o mesmo valor enserido no filtro$/, function () {
    return page.getAllItems(2).each(function (colunaEndereco) {
      return expect(colunaEndereco.getText()).to.eventually.equal($SEARCH_TERM);
    });
  });

  this.Given(/^que eu desejo visualizar um relato$/, function () {
    //TODO: saber o que realmente deve ser feito aqui alem de checar a url

    //deve acabar com a url /#/reports/:num
    return expect(this.currentUrl()).to.eventually.match(/\#\/reports/);
  });

  this.Given(/^que pretendo editar um relato$/, function () {
    //TODO: saber o que realmente deve ser feito aqui alem de checar a url

    //deve acabar com a url /#/reports/:num
    return expect(this.currentUrl()).to.eventually.match(/\#\/reports/);
  });

  this.Then(/^eu clico em cima do relato desejado$/, function () {
    return page.reports().first().click();
  });

  this.Then(/^assim devo ser capaz de visualizar todos os dados do relato$/, function () {
    //deve acabar com a url /#/reports/:num
    return expect(this.currentUrl()).to.eventually.match(/\#\/reports/);
  });

  this.Then(/^assim devo ser capaz de visualizar o botões de editar e alterar$/, function () {
    return Promise.all([
      expect(element.all(by.linkText('Alterar')).count()).to.eventually.greaterThan(0),
      expect(element.all(by.linkText('Editar')).count()).to.eventually.greaterThan(0)
    ]);
  });

  this.Given(/^carrego a lista de relatos$/, hasReports);
};
