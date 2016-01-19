var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.cookie('serverCookie','FromServer');
	res.render('index', { title: 'Express', cookie: JSON.stringify(req.cookies), 
		signed: JSON.stringify(req.signedCookies) , session: JSON.stringify(req.session) });
});

module.exports = router;
