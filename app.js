var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var csurf = require('csurf');
var session = require('express-session');
var auth_info = require('./lib/credentials');
var redis = require('redis');
var client = redis.createClient();
var redis_store = require('connect-redis')(session);
var redisAdaptor = require('socket.io-redis');
var utils = require('./lib/utils');
var flash = require('connect-flash');
var config = require('./config');
var passport = require('./lib/passport');
var sessionMiddleware = session({ secret : auth_info.sess_secret,
  resave : true,
  saveUninitialized: true,
  cookie: {
        maxAge: 31536000000
    },
  store: new redis_store({
    host: config.redisHost,
    port: config.redisPort,
    client: client
  })
}
)


var routes = require('./routes/index');
var login = require('./routes/login');
var chat = require('./routes/chat');
var logout = require('./routes/logout');

var app = express();
var httpServer = require('http').createServer(app);
var io = require('socket.io')(httpServer);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(auth_info.sess_secret));
app.use(cookieParser());
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(sessionMiddleware);
app.use(flash());
app.use(csurf());
app.use(utils.csf);
app.use(utils.isAuthenticated);
app.use(passport.passport.initialize());
app.use(passport.passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/login', login);
app.use('/chat', utils.requireAuth, chat);
app.use('/logout',logout);


io.on('connection',function(socket){
  console.log("connected user with id  " + socket.id);
  console.log("Trying to get SID + " + socket.request.headers.cookie);
  console.log("Checking user value " + socket.request.session.user.username );
  socket.broadcast.emit('joined',{user: socket.request.session.user.username, socket_id: socket.id});
  socket.on('sent',function(data){
    console.log(data);
  })
  socket.on('onChat',function(data){
    socket.join(data.uid);
  })
  socket.on('disconnect',function(){
    console.log("User disconnected");
    socket.broadcast.emit('left',{user: socket.request.session.user.username});
  })
  socket.on('private',function(data){
    console.log("Private ping received");
    console.log("sender " + socket.request.session.user.username );
    io.sockets.connected[data.scid].emit('rcprivate',{user: socket.request.session.user.username })
  })
  socket.on('createroom',function(data){
    console.log('a pvt room craeted');
    var roomName = data.roomId;
    try{
    io.of("/"+roomName).on('connection',function(socketP){
        console.log("Pvt room craeted " + roomName);
        socketP.emit('joined',{user:"poik"});
    })
        socket.emit('rcreated');
        socket.broadcast.emit('somecreated',{roomId:roomName});
      }
    catch(err) {
      console.log("erroedd");
    }  
  })
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = { 
  app: app,
  httpServer: httpServer
}
