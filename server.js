var express = require('express');
var app = express();
var server = require('http').Server(app);
var { Server } = require('socket.io');
var io = new Server(server);

app.use('/assets',express.static(__dirname + '/assets'));
app.use('/src', express.static(__dirname + '/src'));
app.use('/', express.static(__dirname));


app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

server.lastPlayerId = 0;

// Example socket.io event handling
io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('newplayer', () => {        
        socket.player = {
            id: server.lastPlayerId++
        };
        socket.emit('allplayers',getAllPlayers());
        socket.broadcast.emit('newplayer',socket.player);
        console.log('New player connected with ID:', server.lastPlayerId);
    });
});

function getAllPlayers() {
    let players = [];
    Object.keys(io.sockets.connected).forEach((socketID) => {
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}