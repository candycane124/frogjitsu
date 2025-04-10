import { Start } from './scenes/Start.js';
import { Menu, End, Instructions } from './scenes/Menu.js';

const config = {
    type: Phaser.AUTO,
    title: 'FrogJitsu',
    description: '',
    parent: 'game-container',
    width: 1024,
    height: 768,
    pixelArt: false,
    scene: [
        Menu,
        Start,
        End,
        Instructions
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}
new Phaser.Game(config);
            