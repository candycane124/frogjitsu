/*
FrogJitsu
Angela Huang

to-do:
() [feat] add in-game instructions for current game stage - roll dice, move your character, pick a card
() [epic][feat] multiplayer!
    - research...
() [feat][enhance] keyboard movement: wasd & arrow keys to move on board
() [epic][feat] powerups 2.0
    - add in-fight info for any current powerup that will be applied
    - change card to show effective value after equipped
    - hand size powerups: assets, spawn, collect, apply
    - discard card powerups: assets, spawn, collect, apply
() [dev][enhance] direction message for win by 4 elements of a direction
() [feat] better menu screen graphics
() [bug] esc pause menu does not pause fight scene or disable input for rolling dice

completed:
(x) implement fight function to compare cards
(x) have computer pick random card after you equip, add time delay
(x) figure out best way to render cards & get assets
(x) disable clicking of opponents cards
(x) add text/in-game feedback for win
(x) reorganize code + separate board & fight
(x) FE collection
(x) BE collect card
(x) create frog/avatar assets & add to game with spawn
(x) [bug] unrender computer collection when not fighting
(x) [feat] add win condition
(x) [bug] tie rematch does not work
(x) [dev] add to github & move to vscode
(x) [enhance] update card directions to be black
(x) [feat][art] all element tile
(x) [epic][feat] board movement(x) [feat] add info text
(x) [feat] all element fight
(x) [epic][feat] powerups
(x) [epic][feat] player customization
(x) [bug] collection text keeps rerendering on top of each other making bold text
*/

import { Elements, Player, Fight, SCREEN_HEIGHT, SCREEN_WIDTH, Powerups } from './Common.js';

const SCREEN_MIDDLE_X = SCREEN_WIDTH/2;
const SCREEN_MIDDLE_Y = SCREEN_HEIGHT/2;

const PLAYER_COLLECTION_Y = SCREEN_HEIGHT*25/32;
const PLAYER_HAND_Y = SCREEN_HEIGHT*7/8;
const PLAYER_EQUIP_X = SCREEN_WIDTH*3/4;

const COMP_COLLECTION_Y = SCREEN_HEIGHT*7/32;
const COMP_HAND_Y = SCREEN_HEIGHT*1/8;
const COMP_EQUIP_X = SCREEN_WIDTH*1/4;


const SPACE_SCALE = 0.125
const SPACE_SIZE = 64;

export class Start extends Phaser.Scene
{
    constructor()
    {
        super('Start');
    }

    init(data) {
        this.frog = data.frog
        this.username = data.username || 'Player';
    }

    preload()
    {
        // LOAD ASSETS
        //spaces
        this.load.image('space-fire','assets/spaces/space-fire.png');
        this.load.image('space-water','assets/spaces/space-water.png');
        this.load.image('space-earth','assets/spaces/space-earth.png');
        this.load.image('space-air','assets/spaces/space-air.png');
        this.load.image('space-all','assets/spaces/space-all.png');
        this.load.image('space-none','assets/spaces/space-none.png');
        //cards
        this.load.image('card-fire','assets/cards/card-fire.png');
        this.load.image('card-water','assets/cards/card-water.png');
        this.load.image('card-earth','assets/cards/card-earth.png');
        this.load.image('card-air','assets/cards/card-air.png');
        this.load.image('card-north','assets/cards/card-north.png');
        this.load.image('card-east','assets/cards/card-east.png');
        this.load.image('card-south','assets/cards/card-south.png');
        this.load.image('card-west','assets/cards/card-west.png');
        for (let i = 0; i < 12; i++) {
            this.load.image('card-'+i.toString(),'assets/cards/card-'+i.toString()+'.png');
        }
        //dice
        for (let i = 0; i <= 6; i++) {
            this.load.image('dice-'+i.toString(),'assets/die/dice-'+i.toString()+'.png');
        }
        //info
        this.load.image('info-fire','assets/info/element-info-fire.png');
        this.load.image('info-water','assets/info/element-info-water.png');
        this.load.image('info-earth','assets/info/element-info-earth.png');
        this.load.image('info-air','assets/info/element-info-air.png');
        this.load.image('info-all','assets/info/element-info-all.png');
        //powerups
        const elements = [Elements.FIRE, Elements.AIR, Elements.WATER, Elements.EARTH];
        for (let e of elements) {
            for (let i in Powerups[e]) {
                const powerupName = Powerups[e][i]['name'];
                const filePath = `assets/powerups/${e}/powerup-${powerupName}.png`;
                this.load.image(`powerup-${powerupName}`, filePath);
            }
        }
    }

    create()
    {
        let spawns = [
            [SCREEN_MIDDLE_X,SCREEN_MIDDLE_Y-2*SPACE_SIZE],
            [SCREEN_MIDDLE_X+2*SPACE_SIZE,SCREEN_MIDDLE_Y],
            [SCREEN_MIDDLE_X,SCREEN_MIDDLE_Y+2*SPACE_SIZE],
            [SCREEN_MIDDLE_X-2*SPACE_SIZE,SCREEN_MIDDLE_Y]
        ]
        let randSpawn = Math.floor(Math.random()*4);
        let compSpawn = (randSpawn+2)%4;
        console.log("p1 spawn: ", randSpawn, "p2 spawn: ", compSpawn);

        this.#generateBoard(spawns);

        let computerFrog = {
            "colour": "frog-gray",
            "hat": null,
            "accessory": null,
        }
        this.p1 = new Player(this.username,this.frog,this,spawns[randSpawn][0],spawns[randSpawn][1],PLAYER_EQUIP_X,SCREEN_MIDDLE_Y,7);
        this.p2 = new Player("Computer",computerFrog,this,spawns[compSpawn][0],spawns[compSpawn][1],COMP_EQUIP_X);

        console.log(this.p1);
        console.log(this.p2);

        this.p1.renderHand(SCREEN_MIDDLE_X,PLAYER_HAND_Y,false);
        this.p1.renderCollection(SCREEN_MIDDLE_X,PLAYER_COLLECTION_Y,1);

        this.fightInProgress = false;

        this.#generateDice();

        this.powerup = null;

        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.pauseMenu) {
                const blocker = this.add.rectangle(0,0,SCREEN_WIDTH,SCREEN_HEIGHT,0x000000,0.1).setOrigin(0).setDepth(1000).setInteractive();
                const menuBackground = this.add.rectangle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5, 0x000000, 0.8).setOrigin(0.5).setDepth(1001);
                
                const continueButton = this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 30, "Resume", {
                    fontSize: '32px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    backgroundColor: '#00FF00',
                    padding: { x: 10, y: 5 },
                    align: 'center'
                }).setOrigin(0.5).setDepth(1002).setInteractive().on('pointerdown', () => {
                    this.pauseMenu.destroy(true);
                    this.pauseMenu = null;
                });
                const exitButton = this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 30, "Quit", {
                    fontSize: '32px',
                    fontFamily: 'Arial',
                    color: '#FFFFFF',
                    backgroundColor: '#FF0000',
                    padding: { x: 10, y: 5 },
                    align: 'center'
                }).setOrigin(0.5).setDepth(1002).setInteractive().on('pointerdown', () => {
                    this.scene.start('Menu', {});
                });

                this.pauseMenu = this.add.container(0, 0, [blocker, menuBackground, exitButton, continueButton]);
            }
        });

        this.events.on('shutdown', () => {
            if (this.mouseText) {
                this.mouseText.destroy();
                this.mouseText = null;
            }
        });
    }

    #generateDice() {
        let roll = this.add.image(PLAYER_EQUIP_X,SCREEN_MIDDLE_Y,'dice-0').setScale(SPACE_SCALE/1.5).setInteractive();

        const rollDice = () => {
            let rolled = Math.floor(Math.random()*4)+1;
            console.log("rolled: ", rolled);
            this.dice = this.add.image(PLAYER_EQUIP_X,SCREEN_MIDDLE_Y,'dice-'+rolled.toString()).setScale(SPACE_SCALE/1.5);
            this.p1.setMoves(rolled);
            roll.destroy();
        };

        roll.on('pointerdown', rollDice);

        this.input.keyboard.on('keydown-R', () => {
            if (roll.active) { 
                rollDice();
            }
        });
    }

    #checkValidMove(px,py,x,y) {
        return (Math.abs(px-x) == SPACE_SIZE && py == y) || (px == x && Math.abs(py-y) == SPACE_SIZE);
    }

    #movePlayer(p, x, y, e) {
        let [px,py] = p.getCharacterPos();
        console.log(`attempting to move player from (${px},${py}) to (${x},${y})`);
        if (this.#checkValidMove(px,py,x,y) && p.getMoves() > 0) {
            p.moveCharacter(x,y);
            this.spaceElement = e;
            p.modifyMoves(-1);

            const movesLeft = p.getMoves();
            if (this.dice) {
                this.dice.setTexture('dice-' + movesLeft);
            }

            if (this.powerup && this.powerup.x === x && this.powerup.y === y) {
                console.log(`${p.name} got a powerup: ${this.powerup.texture.key}!`);
                p.setPowerup(this.powerup.texture.key);
                this.powerup.destroy();
                this.powerup = null;
            }

            if (movesLeft == 0) {
                this.#startFightScene();
            }
        }
    }

    #generateBoard(spawns) {
        this.cameras.main.setBackgroundColor('#DDD');

        //generate map
        const elements = [Elements.FIRE, Elements.AIR, Elements.WATER, Elements.EARTH];
        let spaces = [...elements, ...elements];
        // shuffle with Fisher-Yates algorithm
        for (let i = spaces.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [spaces[i], spaces[j]] = [spaces[j], spaces[i]]; // Swap elements
        }
        spaces.splice(4, 0, Elements.ALL);

        this.mapList = spaces;
        console.log(spaces)

        let anchorX = SCREEN_MIDDLE_X-SPACE_SIZE;
        let anchorY = SCREEN_MIDDLE_Y-SPACE_SIZE;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let currentElement = spaces[i*3+j];
                let space = this.add.image(anchorX+SPACE_SIZE*j,anchorY+SPACE_SIZE*i,'space-'+currentElement).setScale(SPACE_SCALE);
                space.setInteractive().setData({
                    "id": i*3+j,
                    "spaceElement": currentElement
                });
                space.on('pointerdown', () => {
                    this.#movePlayer(this.p1,anchorX+SPACE_SIZE*j,anchorY+SPACE_SIZE*i,currentElement);
                });
            }
        }
        // spawn spaces
        for (let [x, y] of spawns) {
            this.add.image(x, y, 'space-none').setScale(SPACE_SCALE).setData({
                "spaceElement": Elements.NONE
            });
        }
    }

    #showBoard(visible) {
        this.children.list.forEach(child => {
            if (child.getData('spaceElement')) {
                child.setVisible(visible);
            }
        });
    }

    #generatePowerup() {
        const p1Pos = this.p1.getCharacterPos();
        let px = (p1Pos[0]+SPACE_SIZE-SCREEN_MIDDLE_X)/SPACE_SIZE
        let py = (p1Pos[1]+SPACE_SIZE-SCREEN_MIDDLE_Y)/SPACE_SIZE
        // console.log(px,py)
        let randPowerup = Math.floor(Math.random()*2);
        let randSpace = Math.floor(Math.random()*9);
        while (randSpace == 4 || randSpace == px+py*3) {
            randSpace = Math.floor(Math.random()*9);
        }
        let x = randSpace%3*SPACE_SIZE+SCREEN_MIDDLE_X-SPACE_SIZE;
        let y = Math.floor(randSpace/3)*SPACE_SIZE+SCREEN_MIDDLE_Y-SPACE_SIZE;
        console.log(`powerup type ${randPowerup} at (${x},${y}) on element ${this.mapList[randSpace]}`);
        this.powerup = this.add.image(x,y,'powerup-'+Powerups[this.mapList[randSpace]][randPowerup]['name']).setScale(SPACE_SCALE/2);
    }

    #startFightScene() {
        // console.log("Fight scene initializing...");

        let bgcolours = {
            'fire': "0xEAA",
            'earth': "0xAEA",
            'water': "0xAAE",
            'air': "0xEEA",
            'all': "0xEEE",
        }

        this.cameras.main.setBackgroundColor(bgcolours[this.spaceElement]);

        if (this.powerup) {
            this.powerup.destroy();
            this.powerup = null;
        }

        this.#showBoard(false);
        this.p1.setCharacterVisible(false);
        this.p2.setCharacterVisible(false);

        this.p1.renderHand(SCREEN_MIDDLE_X, PLAYER_HAND_Y, true);
        this.p2.renderHand(SCREEN_MIDDLE_X, COMP_HAND_Y, false);
        this.p2.renderCollection(SCREEN_MIDDLE_X,COMP_COLLECTION_Y,0);

        this.dice.destroy();

        this.info = this.add.image(SCREEN_WIDTH*7/8,SCREEN_HEIGHT*1/4,'info-' + this.spaceElement).setScale(SPACE_SCALE);
    }

    #triggerFight() {
        let winner = Fight(this.p1,this.p2,this.spaceElement);
        let result = winner ? `${winner.name} wins` : "tie";

        let resultText = this.add.text(SCREEN_MIDDLE_X, SCREEN_MIDDLE_Y, result, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5);

        this.time.delayedCall(1800, () => {
            resultText.destroy();
            if (winner) {
                winner.collectCard(winner.equipped);
                this.p1.destroyCollection();
                this.p1.renderCollection(SCREEN_MIDDLE_X, PLAYER_COLLECTION_Y,1);
            }

            this.p1.unequip();
            this.p2.unequip();
           
            this.fightInProgress = false;
            if (winner) {
                this.#checkWinner();

                this.#showBoard(true);
                this.#generatePowerup();
                
                this.p1.hand.forEach(card => card.setVisible(false));
                this.p2.hand.forEach(card => card.setVisible(false));
                this.p1.renderHand(SCREEN_MIDDLE_X,PLAYER_HAND_Y,false);
                this.p2.destroyCollection();

                this.p1.setPowerup(null);
                this.p2.setPowerup(null);

                this.cameras.main.setBackgroundColor('#DDD');
                this.p1.setCharacterVisible(true);
                this.p2.setCharacterVisible(true);
                this.#generateDice();

                this.info.destroy();
            } else {
                this.p1.renderHand(SCREEN_MIDDLE_X, PLAYER_HAND_Y, true);
                this.p2.renderHand(SCREEN_MIDDLE_X, COMP_HAND_Y, false);
            }
        });
    }

    #checkWinner() {
        if (this.p1.checkWin()) {
            this.scene.start('End', { won: true });
        }
        else if (this.p2.checkWin()) {
            this.scene.start('End', { won: false });
        }
    }

    update()
    {
        if (this.p1.equipped && !this.fightInProgress) {
            this.fightInProgress = true;
            this.time.delayedCall(1000,() => {
                // console.log("opponent picking...");
                this.p2.equipCard(this.p2.hand[Math.floor(Math.random() * 6)]);
                this.#triggerFight();
            },this);
        }

        // Display mouse coordinates for troubleshooting
        if (!this.mouseText) {
            this.mouseText = this.add.text(10, 10, '', {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#000000',
                backgroundColor: '#FFFFFF',
                padding: { x: 5, y: 2 }
            }).setDepth(1000); // Ensure it's always on top
        }

        const pointer = this.input.activePointer;
        this.mouseText.setText(`Mouse: (${pointer.x.toFixed(0)}, ${pointer.y.toFixed(0)})`);

    }
}
