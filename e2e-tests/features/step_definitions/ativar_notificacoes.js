//var Reports = require('../support/notificacoes');
var chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-string'));
var expect = chai.expect;

module.exports = function () {
    this.Given(/^o sistema deve me retornar a listagem de relatos das categorias$/, function (callback) {
        return element(by.css('[href="#/reports/categories"]')).click();
    });

    this.Given(/^que eu selecione a opção para editar categoria de relato$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

    this.Given(/^eu selecionar uma categoria$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

    this.Given(/^o sistema deve exibir a seção de configurar notificações$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

    this.Given(/^seleciono para exibir notificações$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

    this.Given(/^ao selecionar o botão para atualizar a categoria$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

    this.Given(/^devo receber uma mensagem de sucesso$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });
}
