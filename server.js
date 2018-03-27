
var PORT = 8080;                                                                 

var express = require('express');
var bodyParser = require('body-parser');                                         
var http = require('http');                                                      
var app = express(); 

app.use(bodyParser.json());                                                      
app.use(bodyParser.urlencoded({ extended: false }));


// for view test
//var path = require('path');
//var router = express.Router();  
app.get('/', function (req, res) {
   res.sendfile(__dirname + '/index.html');
})
//app.use(express.static('public'));


//var path = require('path');  
var server = http.Server(app);
var io = require('socket.io').listen(server);                                    
var count = {};



io.on('connection', function (socket) {  

	var query = socket.handshake.query;
	var channel = query.client_id + '/' + query.channel;

	// 將用戶歸類
	socket.on('join', () => {
		socket.join(channel);
		count[channel] = count[channel]==undefined ? 1 : count[channel]+1;
		console.log('join: ', channel, count[channel]);
	});

	// 用戶發佈
	socket.on('publish', (msg) => {
		socket.to(channel).emit('subscribe', msg)
		socket.emit('subscribe', msg)
	});

	// 用戶離線
	socket.on('disconnect', () => {
		socket.leave(channel, (err)=>{
			if (err){
				console.log(err)
			}else{
				count[channel] = count[channel]-1;
				console.log('leave: ', channel, count[channel]);
			}
		});
	});
});



server.listen(PORT); 
console.log('chatroom started up on port '+PORT);
module.exports = server; 
