require('dotenv').load({ silent: true });
var baseUrl = ('http://' + process.env.SERVER_IP + ':' + process.env.SERVER_PORT);

exports.config = {
  allScriptsTimeout: 30000,
  onPrepare: function () {
    return browser.driver.manage().window().setSize(1600, 800);
  },

  baseUrl: baseUrl,
  directConnect : process.env.DEBUG_TESTS || false,
  framework: 'cucumber',

  specs: [
    'features/cases/**/*.feature'
  ],
  capabilities: {
    'browserName': 'chrome',
    'version': 'ANY'
  },
  cucumberOpts: {
    require: 'features/step_definitions/*.js',
    tags: '~@notimplemented',
    format: 'pretty'
  }
};
