
var express = require('express');
var router = express.Router();
var utils = require('../lib/utils')

/* GET home page. */
router.get('/', function(req, res, next) {
	utils.logOut(req.session);	
	console.log("Auth bool is " + res.locals.isAuthenticated);
  	req.flash('Logout',"You have been logged out");
  	res.redirect('../')
});


module.exports = router;

