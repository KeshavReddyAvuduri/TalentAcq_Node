
var socketio = require('socket.io');

module.exports = function(app, appServer){
	var socketIOServer = socketio(appServer);

	// Make socketio accessible to our router
	app.use(function(req, res, next){
	    req.socketio = socketIOServer;
	    next();
	});
	
	socketIOServer.on('connection', function (socket) {
	    socket.on('disconnect', function () { 
	        console.log("A client Disconnected.");
	    });
	});
}