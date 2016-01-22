
var express = require('express');
var router = express.Router();
var utils = require('../lib/utils')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/',function(req,res,next){
  console.log("Logged in " + req.body.username);
  var authB = utils.userAuth(req.body.username,req.body.password,req.session);
  if(authB){
  		req.flash('success','Logged SUccessfully');
  }
  else{
  		req.flash('error','Wrong username or passwd');
  }
  res.redirect(303,'../chat');
});

module.exports = router;

