const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 768;
const SCREEN_MIDDLE_X = SCREEN_WIDTH/2;
const SCREEN_MIDDLE_Y = SCREEN_HEIGHT/2;
const SPACE_SIZE = 64;

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

io.on('connection', (socket) => {
    socket.on('newplayer', () => {      
        console.log('New player connected with ID:', server.lastPlayerId);  
        socket.player = {
            id: server.lastPlayerId++
        };
        server.players[socket.player.id] = { ready: false, socket: socket };
        socket.emit('allplayers',getAllPlayers(socket.player));
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('ready', (playerData) => {
            // Mark this player as ready and store their data
            server.players[socket.player.id].ready = true;
            server.players[socket.player.id].data = playerData;
            // Check if two players are ready
            const readyPlayers = Object.values(server.players).filter(p => p.ready);
            if (readyPlayers.length === 2) {
                const allPlayerData = readyPlayers.map(p => p.data);

                //generate random spawn points
                let spawns = [
                    [SCREEN_MIDDLE_X,SCREEN_MIDDLE_Y-2*SPACE_SIZE],
                    [SCREEN_MIDDLE_X+2*SPACE_SIZE,SCREEN_MIDDLE_Y],
                    [SCREEN_MIDDLE_X,SCREEN_MIDDLE_Y+2*SPACE_SIZE],
                    [SCREEN_MIDDLE_X-2*SPACE_SIZE,SCREEN_MIDDLE_Y]
                ]
                let spawn1 = Math.floor(Math.random()*4);
                let spawn2 = (spawn1+2)%4;
                console.log("p1 spawn: ", spawn1, "p2 spawn: ", spawn2);
                allPlayerData[0].spawn = spawns[spawn1];
                allPlayerData[1].spawn = spawns[spawn2];

                // pick random player to start
                let turn = allPlayerData[Math.floor(Math.random()*2)].id;
                allPlayerData[0].turn = turn;
                allPlayerData[1].turn = turn;
                console.log(turn, "goes first");

                // console.log('ready & starting game', server.players, allPlayerData);
                io.emit('startgame', allPlayerData);

                // Reset readiness for next game if needed
                Object.values(server.players).forEach(p => p.ready = false);
            }
        });

        socket.on('update', (playerData) => {
            // console.log('Player update: ', server.players[playerData.otherId], playerData);
            server.players[playerData.otherId].socket.emit('update', playerData);
            // socket.broadcast.emit('update', playerData);
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