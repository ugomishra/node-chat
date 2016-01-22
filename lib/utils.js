module.exports.csf = function(req,res,next){
	res.locals.token = req.csrfToken();
	next();
} 

module.exports.isAuthenticated = function(req,res,next){
	res.locals.isAuthenticated = req.session.isAuthenticated;
	console.log("Session auth value is " + req.session.isAuthenticated);
	if(req.session.isAuthenticated){
		res.locals.user = req.session.user;
	}
	next();
}

module.exports.requireAuth = function(req,res,next){
	if(req.session.isAuthenticated){
		next()
	}
	else{
		res.redirect(303,'/login');
	}

}

module.exports.userAuth = function(user, pass, session){
	if((user == 'vikas' || user == 'pinku' || user == 'rusty') && pass == "black@123"){
		console.log("Auth success");
		session.isAuthenticated = true;
		session.user = {username: user};	
		return true;
	}
	else{
		console.log("Auth Failed");
		session.isAuthenticated = false;
		session.user = null;
		return false;		
	}
}

module.exports.logOut = function logOut(session){
	session.isAuthenticated = false;
	delete session.user;
};