import { SCREEN_HEIGHT, SCREEN_WIDTH } from './Common.js';

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
        this.load.image('frog-blue','assets/frogs/frog-blue.png');
        this.load.image('frog-green','assets/frogs/frog-green.png');
        this.load.image('frog-red','assets/frogs/frog-red.png');
        this.load.image('frog-yellow','assets/frogs/frog-yellow.png');
        this.load.image('frog-gray','assets/frogs/frog-gray.png')
    }

    create()
    {
        this.cameras.main.setBackgroundColor('#DDD');

        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*1/4, 
            "CHOOSE YOUR FROG", 
            {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
            }
        ).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*7/8-24, 
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

        const frogs = [
            { key: 'frog-blue', x: SCREEN_WIDTH/2-GAP*3/2-FROG_SIZE*3/2 },
            { key: 'frog-green', x: SCREEN_WIDTH/2-GAP/2-FROG_SIZE/2 },
            { key: 'frog-red', x: SCREEN_WIDTH/2+GAP/2+FROG_SIZE/2 },
            { key: 'frog-yellow', x: SCREEN_WIDTH/2+GAP*3/2+FROG_SIZE*3/2 }
        ];

        frogs.forEach(frog => {
            let highlight = this.add.rectangle(frog.x, SCREEN_HEIGHT/2, 200, 200, 0xdddd99, 0.5).setVisible(false);
            
            let sprite = this.add.image(frog.x, SCREEN_HEIGHT/2, frog.key).setScale(FROG_SCALE).setInteractive();
            sprite.on('pointerdown', () => {
                this.scene.start('Start', { selectedFrog: frog.key });
            });

            sprite.on('pointerover', () => {
                highlight.setVisible(true);
            });
            sprite.on('pointerout', () => {
                highlight.setVisible(false);
            });
        });
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

        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*7/8-24, 
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
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*7/8+36, 
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