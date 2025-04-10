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

        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*3/4, 
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

    create() {
        this.cameras.main.setBackgroundColor('#DDD');

        let title = "🐸 Frogjitsu – How to Play"
        let instructions = `
🎲 Gameplay:
    1. Roll a die to determine how many spaces you can move
    2. When you have 0 moves, a fight begins on the space you landed on
⚔️ Combat Rules:
    1. Each player picks a card from their hand
    2. Elemental advantage rules:
        Fire 🔥 beats Air 🌬️
        Earth 🌱 beats Water 💧
        Air 🌬️ beats Earth 🌱
        Water 💧 beats Fire 🔥
        Plus, the space's element gets an advantage:
            On an Earth space, Earth also beats Fire
            On a Water space, Water also beats Air
            On a Fire space, Fire also beats Earth
            On an Air space, Air also beats Water
    3. If the elements played are not mentioned, a tie occurs
    4. If both players play the same element, the higher number wins
    5. The winner collects the card they played
    6. Both players draw a new card from their deck (unless restricted or modified by powerups)
🎯 Objective:
    Be the first player to either:
        1. Collect all 4 elements (Fire, Water, Earth, Air) of any one direction,
            OR
        2. Collect all 4 directional variants (N/E/S/W) of any one element.
    `
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*1/8, title, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5);
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, instructions, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'left'
        }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*7/8, 
            "Back <", 
            {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            padding: { x: 10, y: 5 },
            align: 'center'
            }
        ).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start('Menu');
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