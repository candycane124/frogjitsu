var Client = {};
Client.socket = io.connect();
console.log("Socket connected:", Client.socket);

Client.menu = null;
Client.setMenu = (menuInstance) => {
    Client.menu = menuInstance;
};

Client.askNewPlayer = () => {
    Client.socket.emit('newplayer');
}

Client.socket.on('newplayer', (player) => {
    Client.menu.addNewPlayer(player.id);
});

Client.socket.on('allplayers', (p) => {
    console.log(p);
    p[0].forEach(player => {
        Client.menu.addNewPlayer(player.id);
    });
    Client.menu.id = p[1];
});

Client.socket.on('remove', (playerId) => {
    Client.menu.removePlayer(playerId);
});