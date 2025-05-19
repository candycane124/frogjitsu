import { SCREEN_HEIGHT, SCREEN_WIDTH, Player } from './Common.js';

const FROG_SCALE = 0.1875;
const FROG_SIZE = 1024*FROG_SCALE;

const GAP = 48;

export class Menu extends Phaser.Scene
{
    constructor()
    {
        super('Menu');
    }

    preload()
    {
        this.load.image('frog-blue','assets/frogs/colours/frog-blue.png');
        this.load.image('frog-green','assets/frogs/colours/frog-green.png');
        this.load.image('frog-red','assets/frogs/colours/frog-red.png');
        this.load.image('frog-yellow','assets/frogs/colours/frog-yellow.png');
        this.load.image('frog-gray','assets/frogs/colours/frog-gray.png');

        this.load.image('hat-0','assets/frogs/hats/hat-0.png');
        this.load.image('hat-1','assets/frogs/hats/hat-1.png');
        this.load.image('hat-2','assets/frogs/hats/hat-2.png');
        this.load.image('hat-3','assets/frogs/hats/hat-3.png');
        this.load.image('hat-4','assets/frogs/hats/hat-4.png');
        this.load.image('hat-5','assets/frogs/hats/hat-5.png');
        this.load.image('hat-6','assets/frogs/hats/hat-6.png');

        this.load.image('accessory-0','assets/frogs/accessories/accessory-0.png');
        this.load.image('accessory-1','assets/frogs/accessories/accessory-1.png');
        this.load.image('accessory-2','assets/frogs/accessories/accessory-2.png');
        this.load.image('accessory-3','assets/frogs/accessories/accessory-3.png');
        this.load.image('accessory-4','assets/frogs/accessories/accessory-4.png');
        this.load.image('accessory-5','assets/frogs/accessories/accessory-5.png');
    }

    create()
    {
        this.#multiplayer();

        this.frog = {
            "colour": "frog-blue",
            "hat": null,
            "accessory": null,
        }

        this.cameras.main.setBackgroundColor('#878');

        this.add.text(SCREEN_WIDTH*1/4, SCREEN_HEIGHT*3/32, 
            "Username:", 
            {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'left'
            }
        ).setOrigin(0.5);

        const inputBox = this.add.dom(SCREEN_WIDTH*1/4, SCREEN_HEIGHT*6/32).createFromHTML(`
            <input type="text" id="username-input" placeholder="Player" style="
                font-size: 20px;
                padding: 10px;
                width: 300px;
                text-align: center;
            ">
        `);

        this.playButton = this.add.text(SCREEN_WIDTH*3/4, SCREEN_HEIGHT*6/32, 
            "PLAY >", 
            {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
            }
        ).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            const username = document.getElementById('username-input').value;
            console.log(this.id);
            if (username.length >= 1) {
                this.players[this.id].username = username;
            }
            Client.socket.emit('ready', {
                id: this.id,
                username: this.players[this.id].username,
                frog: this.frog
            });
            // this.players[this.id].frog = this.frog;
            // console.log("starting game, users online: ", this.players);
            // this.scene.start('Start', { players: this.players, id: this.id });

            // Disable all interactive elements
            this.playButton.disableInteractive();
            this.instrButton.disableInteractive();
            this.carouselArrows.forEach(arrow => arrow.disableInteractive());
            inputBox.node.disabled = true; // disables the username input

            // Optionally, show a waiting message
            if (!this.waitingText) {
                this.waitingText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*15/32, "Waiting for another player...", {
                    fontSize: '28px',
                    fontFamily: 'Arial',
                    color: '#000000',
                    backgroundColor: '#FFFFFF',
                    padding: { x: 10, y: 5 },
                    align: 'center'
                }).setOrigin(0.5);
            }
        });

        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*9/32, 
            "Customize your frog:", 
            {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
            }
        ).setOrigin(0.5);

        const colours = ['frog-blue','frog-green','frog-red','frog-yellow'];
        const hats = ['hat-0','hat-1','hat-2','hat-3','hat-4','hat-5','hat-6'];
        const accessories = ['accessory-0','accessory-1','accessory-2','accessory-3','accessory-4','accessory-5'];
        let currColour = 0;
        let currHat = 0;
        let currAccessory = 0;

        let frogSprite = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT*18/32, colours[currColour]).setScale(FROG_SCALE);
        let hatSprite = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT*14/32, hats[currHat]).setScale(FROG_SCALE);
        let accessorySprite = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT*18/32, accessories[currAccessory]).setScale(FROG_SCALE);

        this.carouselArrows = [];
        this.#carouselArrows(frogSprite, colours, currColour, "colour", SCREEN_HEIGHT*18/32);
        this.#carouselArrows(hatSprite, hats, currHat, "hat", SCREEN_HEIGHT*14/32);
        this.#carouselArrows(accessorySprite, accessories, currAccessory, "accessory", SCREEN_HEIGHT*22/32);

        this.instrButton = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*27/32, 
            "How to play?", 
            {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
            }
        ).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start('Instructions');
        });

        Client.socket.on('startgame', (data) => {
            console.log("starting game: ", data);
            if (data.allPlayerData.some(player => player.id === this.id)) {
                data.allPlayerData.forEach(player => {
                    this.players[player.id].username = player.username;
                    this.players[player.id].frog = player.frog;
                    this.players[player.id].spawn = player.spawn;
                });
                this.scene.start('Start', { 
                    players: this.players, id: this.id, 
                    turn: data.gameData.turn, spaces: data.gameData.spaces 
                });
            }
        });
    }

    #carouselArrows(sprite, cycleList, currIndex, property, y) {
        const leftArrow = this.add.text(SCREEN_WIDTH*1/4, y, "<", {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            currIndex = (currIndex - 1 + cycleList.length) % cycleList.length;
            sprite.setTexture(cycleList[currIndex]);
            this.frog[property] = cycleList[currIndex];
        });
    
        // Add right navigation button
        const rightArrow = this.add.text(SCREEN_WIDTH*3/4, y, ">", {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            currIndex = (currIndex + 1) % cycleList.length;
            sprite.setTexture(cycleList[currIndex]);
            this.frog[property] = cycleList[currIndex];
        });

        this.carouselArrows.push(leftArrow);
        this.carouselArrows.push(rightArrow);
    }

    #multiplayer() {
        this.players = {};
        Client.setMenu(this);
        Client.askNewPlayer();
        console.log(this.players);
    }

    addNewPlayer(id) {
        console.log("new player joined, adding them to players", id);
        let newPlayer = {
            username: "player" + id,
            frog: {
                "colour": "frog-blue",
                "hat": null,
                "accessory": null,
            },
        }
        this.players[id] = newPlayer;
    }

    removePlayer(id) {
        console.log("player left, removing them from players", id);
        delete this.players[id];
    }

    update()
    {
        // // Display mouse coordinates for troubleshooting
        // if (!this.mouseText) {
        //     this.mouseText = this.add.text(10, 10, '', {
        //         fontSize: '16px',
        //         fontFamily: 'Arial',
        //         color: '#000000',
        //         backgroundColor: '#FFFFFF',
        //         padding: { x: 5, y: 2 }
        //     }).setDepth(1000); // Ensure it's always on top
        // }

        // const pointer = this.input.activePointer;
        // this.mouseText.setText(`Mouse: (${pointer.x.toFixed(0)}, ${pointer.y.toFixed(0)})`);

    }
}

export class Instructions extends Phaser.Scene {
    constructor()
    {
        super('Instructions');
    }

    preload() {
        this.load.image('main-screen-info','assets/info/main-screen-info.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#DDD');

        this.page = 0;
        let title = "🐸 Frogjitsu – How to Play"
        let instructionText = [
            `
🎯 Objective:
    Be the first player to either:
        1. COLLECT all 4 ELEMENTS (Fire, Water, Earth, Air) of any one DIRECTION,
            OR
        2. COLLECT all 4 DIRECTIONS (N/E/S/W) of any one ELEMENT.

🎲 Gameplay:
    1. Roll a die to determine how many spaces you can move
    2. When you have 0 moves, FIGHT on the space you landed on
            `,`
⚔️ Fight Rules:
    1. Each player picks a CARD from their HAND
    2. Both players draw a new CARD from their DECK that gets added to their HAND
    3. Elemental advantage rules:
            Fire 🔥 beats Air 💨
            Earth 🌱 beats Water 💧
            Air 💨 beats Earth 🌱
            Water 💧 beats Fire 🔥
            Plus, the space's element gets an advantage:
                Ex. On an Earth space, Earth also beats Fire;
                On a Water space, Water also beats Air; etc.
                *A helper to show advantages will be shown during a fight
    4. If either player has a POWERUP, it is applied
    5. If both players play the same element, the higher number wins
    6. If the elements played are not menitoned above:
            On an ALL element space, higher number wins, otherwise a tie occurs (go to step 1)
    7. The winner COLLECTS the card they played 
            `,`
🃏 Cards, Hands, Decks:
    CARDS have:
        1. A value (2-8)
        2. An ELEMENT (Air, Water, Earth, Fire)
        3. A DIRECTION (North, East, South, West)
    Players start with 7 CARDS in their HAND, randomly drawn from their DECK
    Each player's starting DECK has 56 CARDS = 
        7 numbers x 4 elements × 4 directions

🌀 Powerups:
    Currently, they are two types of POWERUPS for each ELEMENT:
        1. Boost Powerups (+2 to your card):
            Heat, Flight, Plant, Metal
        2. Debuff Powerups (-2 to opponent's card):
            Lightning, Sound, Steam, Sand
    POWERUPS spawn on a random space on the board after each fight. 
    They are applied to your next fight. Pick them up by landing on them.
            `]
        // An additional eight CARDS of value 9 can be added to your DECK from winning games 
         // (coming soon)

        this.infoImage = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'main-screen-info').setScale(3/8).setVisible(false);
        
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*1/8, title, {
            fontSize: '34px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5);
        let instructions = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, instructionText[this.page], {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'left'
        }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*27/32, 
            "Next >", 
            {
            fontSize: '30px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
            }
        ).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            if (this.page < instructionText.length - 1) {
                this.page++;
                instructions.setText(instructionText[this.page]);
            } else if (this.page == instructionText.length - 1) {
                this.page++;
                instructions.setVisible(false);
                this.infoImage.setVisible(true);
            } else {
                this.scene.start('Menu');
            }
        });

        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*29/32, 
            "Back <", 
            {
            fontSize: '30px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
            }
        ).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            if (this.page > 0) {
                if (this.page == instructionText.length) {
                    this.infoImage.setVisible(false);
                    instructions.setVisible(true);
                }
                this.page--;
                instructions.setText(instructionText[this.page]);
            } else {
                this.scene.start('Menu');
            }
        });
    }
}

export class End extends Phaser.Scene {
    constructor()
    {
        super('End');
    }

    init(data)
    {
        this.won = data.won;
    }

    preload()
    {
        
    }

    create()
    {
        let result = this.won ? "YOU WON" : "YOU LOST";
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, result, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5);
        this.time.delayedCall(5000, () => {
            this.scene.start('Menu');
        });
        this.input.on('pointerdown', () => {
            this.scene.start('Menu');
        })
    }
}