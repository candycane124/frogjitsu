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
server.players = {};

// Example socket.io event handling
io.on('connection', (socket) => {
    socket.on('newplayer', () => {      
        console.log('New player connected with ID:', server.lastPlayerId);  
        socket.player = {
            id: server.lastPlayerId++
        };
        server.players[socket.player.id] = { ready: false, socket: socket, ingame: false };
        socket.emit('allplayers',getAllPlayers(socket.player));
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('ready', (playerData) => {
            // Mark this player as ready and store their data
            server.players[socket.player.id].ready = true;
            server.players[socket.player.id].data = playerData;
            // Check if two players are ready
            const readyPlayers = Object.values(server.players).filter(p => p.ready);
            if (readyPlayers.length === 2) {
                readyPlayers[0].ingame = true;
                readyPlayers[1].ingame = true;
                // Send both players' data to all clients
                const allPlayerData = readyPlayers.map(p => p.data);
                io.emit('startgame', allPlayerData);
                // Reset readiness for next game if needed
                Object.values(server.players).forEach(p => p.ready = false);
                // console.log('Both players are ready, starting game', server.players);
            }
        });

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