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

Client.socket.on('allplayers', (players) => {
    console.log(players);
    players.forEach(player => {
        Client.menu.addNewPlayer(player.id);
    });
});