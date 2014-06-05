
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


var server =  app.listen(3000);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  console.log("user connected");
  //socket.emit('message', { message: 'welcome to the chat' });
  socket.on('asciiFrame', function (data) {
    //console.log("Frame:" + data);
    socket.broadcast.emit('asciiFrame', data);
    //io.sockets.emit('message', data);
  });
});


//http.createServer(app).listen(app.get('port'), function(){
//  console.log('Express server listening on port ' + app.get('port'));
//});
