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
    socket.on('newplayer', () => {      
        console.log('New player connected with ID:', server.lastPlayerId);  
        socket.player = {
            id: server.lastPlayerId++
        };
        socket.emit('allplayers',getAllPlayers(socket.player));
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('disconnect', () => {
            console.log('Player disconnected:', socket.player.id);
            io.emit('remove',socket.player.id);
        });
    });
});

function getAllPlayers(currPlayer) {
    let players = [];
    io.sockets.sockets.forEach((socket) => {
        if (socket.player) {
            players.push(socket.player);
        }
    });
    return [players,currPlayer.id];
}