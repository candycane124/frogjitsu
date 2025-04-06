/*
FrogJitsu
est. 10h
Angela Huang

to-do:
() [feat][art] all element tile
() [epic][feat] board movement
    - spawn: add randomized spawn space
    - dice: figure out where to put, add keyboard shortcut, assign random num 1-5 for moves
    - update pointerdown on space: put into separate function to check if can move to space & if a fight should be started
    - keyboard movement: wasd & arrow keys to move on board
() [feat] add help/info for winning elements & other useful text
() [art] create accessories for frogs + more colours?
() [art][feat] gray frog for computer
() [feat] customize character on menu screen
() [feat] multiplayer
() [dev][enhance] direction message for win by 4 elements of a direction

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
*/

import { Elements, Directions, Player, Fight } from './Common.js';

const PLAYER_HAND_X = 512;
const PLAYER_HAND_Y = 672;
const PLAYER_COLLECTION_Y = 548;
const SPACE_SCALE = 0.1875
const SPACE_SIZE = 96;

export class Start extends Phaser.Scene
{
    constructor()
    {
        super('Start');
    }

    init(data) {
        this.selectedFrog = data.selectedFrog || 'frog-blue';
    }

    preload()
    {
        this.load.image('space-fire','assets/spaces/space-fire.png');
        this.load.image('space-water','assets/spaces/space-water.png');
        this.load.image('space-earth','assets/spaces/space-earth.png');
        this.load.image('space-air','assets/spaces/space-air.png');
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
    }

    create()
    {
        // this.add.image(850, 550, this.selectedFrog).setScale(SPACE_SCALE/1.5);

        this.#generateBoard();

        this.p1 = new Player("candycane123",this.selectedFrog,this,768,336,7,512-SPACE_SIZE,384-SPACE_SIZE);
        this.p2 = new Player("Computer",'frog-blue',this,160);


        console.log(this.p1);
        console.log(this.p2);

        this.p1.renderHand(PLAYER_HAND_X,PLAYER_HAND_Y,false);
        this.p1.renderCollection(PLAYER_HAND_X,PLAYER_COLLECTION_Y,1);

        this.fightInProgress = false;
        // this.input.on('pointerdown', (pointer) => {
        //     this.p1.moveCharacter(pointer.x,pointer.y);
        // });
    }

    #checkValidMove(px,py,x,y) {
        return (Math.abs(px-x) == SPACE_SIZE && py == y) || (px == x && Math.abs(py-y) == SPACE_SIZE);
    }

    #movePlayer(p, x, y, e) {
        let [px,py] = p.getCharacterPos();
        console.log(`attempting to move player from (${px},${py}) to (${x},${y})`);
        if (this.#checkValidMove(px,py,x,y)) {
            p.moveCharacter(x,y);
            this.spaceElement = e;
            this.#startFightScene();
        }
    }

    #generateBoard() {
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

        console.log(spaces)

        let anchorX = 512-SPACE_SIZE;
        let anchorY = 384-SPACE_SIZE;
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
                    // this.p1.moveCharacter(anchorX+SPACE_SIZE*j,anchorY+SPACE_SIZE*i);
                    // console.log(`Clicked on space with element: ${currentElement}`);
                    // this.spaceElement = currentElement;
                    // this.#startFightScene();
                });
            }
        }
    }

    #showBoard(visible) {
        this.children.list.forEach(child => {
            if (child.getData('spaceElement')) {
                child.setVisible(visible);
            }
        });
    }

    #startFightScene() {
        console.log("Fight scene initializing...");

        let bgcolours = {
            'fire': "0xEAA",
            'earth': "0xAEA",
            'water': "0xAAE",
            'air': "0xEEA"
        }

        this.cameras.main.setBackgroundColor(bgcolours[this.spaceElement]);

        this.#showBoard(false);
        this.p1.setCharacterVisible(false);
        this.p2.setCharacterVisible(false);

        this.p1.renderHand(PLAYER_HAND_X, PLAYER_HAND_Y, true);
        this.p2.renderHand(PLAYER_HAND_X, 96, false);
        this.p2.renderCollection(PLAYER_HAND_X,156,0);

    }

    #triggerFight() {
        let winner = Fight(this.p1,this.p2,this.spaceElement);
        let result = winner ? `${winner.name} wins` : "tie";

        let resultText = this.add.text(512, 384, result, {
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
                this.p1.renderCollection(PLAYER_HAND_X,PLAYER_COLLECTION_Y,1);
            }

            this.p1.unequip();
            this.p2.unequip();
           
            this.fightInProgress = false;
            if (winner) {
                this.#showBoard(true);
                this.p1.hand.forEach(card => card.setVisible(false));
                this.p2.hand.forEach(card => card.setVisible(false));
                this.p1.renderHand(PLAYER_HAND_X,PLAYER_HAND_Y,false);
                this.p2.destroyCollection();
                this.#checkWinner();
            } else {
                this.p1.renderHand(PLAYER_HAND_X, PLAYER_HAND_Y, true);
                this.p2.renderHand(PLAYER_HAND_X, 96, false);
            }
        });
    }

    #checkWinner() {
        if (this.p1.checkWin()) {
            this.scene.start('End', { won: true });
        }
        else if (this.p2.checkWin()) {
            this.scene.start('End', { won: false });
        } else {
            this.p1.setCharacterVisible(true);
            this.p2.setCharacterVisible(true);
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

        
    }
}
