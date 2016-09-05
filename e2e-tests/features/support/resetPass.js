function ResetPass(page){
	this.page = page;
}

ResetPass.prototype = {
  open:function(done){
    return element(by.css('.forgot_password')).click().then(function(){
	    done && done();
    });
  },

  setEmail:function(email){
  	var field = element(by.model('user.email'));

    return field.clear().then(function(){
      return field.sendKeys(email);
    });
  },

  send:function(done){
  	return element(by.css('.modal-body button')).click();
  },

  contentDialog:function(){
  	return element(by.css('.modal-body[ng-show] p')).getText();
  }
};

module.exports = ResetPass;
