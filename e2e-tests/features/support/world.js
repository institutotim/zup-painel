var Auth = require('./autenticacao');
var Report = require('./relatos');

function WorldFactory(callback) {
  callback({
    pages: {
      auth: new Auth(),
      report: new Report()
    },
    visit: function (url) {
      return browser.get(url);
    },
    currentUrl: function () {
      return browser.getCurrentUrl();
    },
    getInnerHtmlState: function (el) {
      return element(by.css(el)).getInnerHtml();
    }
  });
}

module.exports.World = WorldFactory;
