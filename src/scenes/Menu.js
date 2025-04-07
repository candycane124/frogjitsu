const FROG_SCALE = 0.1875;
const FROG_SIZE = 1024*FROG_SCALE;
const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 768;
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
        this.add.text(512, 384, result, {
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