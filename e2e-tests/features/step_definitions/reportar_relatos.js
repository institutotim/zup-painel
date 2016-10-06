var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

module.exports = function () {
  var page;
  var form
  var goToNewReport = function(){
    return page.newReport().then(function(){
      form = page.editForm;
    });
  }
  this.World = require('../support/world').World;

  this.Before(function(callback){
    page= this.pages.report;
    callback();
  });

  this.Given(/^clico no botão Novo Relato$/, goToNewReport);

  this.When(/^que preencho os campos obrigatórios do relato$/, function () {
    return form.fillCategory("coleta de entulho")
      .then(function(){
        return form.fillAddress("Rua Julieta vila jordanopolis", "167");
      });
  });

  this.When(/^clico no botão criar relato$/, function () {
    return form.saveReport();
  });

  this.Given(/^faço um upload de uma imagem$/, function () {
    return form.uploadImage();
  });

  this.Given(/^devo visualizar uma aba "(.*)"$/, function (texto) {
    return expect(form.abaIsDisplayed(texto)).to.eventually.true;
  });

  this.Given(/^devo visualizar as imagens que fiz upload$/, function () {
    return expect(form.imageAreaIsDisplayed()).to.eventually.be.true;
  });

  this.Given(/^não devo visualizar uma aba "([^"]*)"$/, function (texto) {
    return expect(form.abaIsDisplayed(texto)).to.eventually.false;
  });

  this.Given(/^não devo visualizar a área de imagens$/, function () {
    return expect(form.imageAreaIsDisplayed()).to.eventually.be.false;
  });

  this.Given(/^escolho a categoria "([^"]*)"$/, function (categoria) {
    return form.fillCategory(categoria);
  });

  this.Given(/^preencho o endereço com "([^"]*)"$/, function (texto) {
    var rua = texto.split(', ')[0];
    var numero = texto.split(', ')[1];

    return form.fillAddress(rua, numero);
  });

  this.Given(/^descrevo a situação com texto: "([^"]*)"$/, function (situacao) {
    return element(by.model('description')).sendKeys(situacao);
  });

  this.Then(/^devo visualizar o nome do usuário atual na area de Histórico$/, function () {
    return expect(element(by.binding('log.user.name')).isDisplayed()).to.eventually.be.true;
  });

  this.When(/^for redirecionado para a exibição dos dados do relato$/, function () {
    return expect(this.currentUrl()).to.eventually.match(/reports\/\d+/);
  });

  this.Then(/^o sistema deve retornar uma mensagem de sucesso$/, function(){
    return expect(element(by.css('.message-status.success')).isPresent()).to.eventually.true;
  });

  this.Given(/^o sistema deve exibir o botão \+ Novo Relato na listagem de relatos$/, function () {
    return expect(element(by.linkText('+ Novo relato')).isDisplayed()).to.eventually.to.be.true;
  });

  this.Given(/^o sistema retorna a tela de criação do relato e exibe o nome do solicitante vinculado ao relato$/, function () {
      return expect(element(by.binding('user.name')).isDisplayed()).to.eventually.be.true;
  });
};
