export const Elements = {
    FIRE: 'fire',
    AIR: 'air',
    WATER: 'water',
    EARTH: 'earth',
    ALL: 'all',
    NONE: 'none'
};

export const Directions = {
    NORTH: 'north',
    EAST: 'east',
    SOUTH: 'south',
    WEST: 'west'
};

export const SCREEN_WIDTH = 1024;
export const SCREEN_HEIGHT = 768;

export const Powerups = {
    [Elements.FIRE]: [
        {'name': "heat", 'description': "+2 value to your equipped card", 'type': "card", 'value': 2},
        {'name': "lightning", 'description': "-2 value to opponent's equipped card", 'type': "card", 'value': -2},
    ],
    [Elements.AIR]: [
        {'name': "flight", 'description': "+2 value to your equipped card", 'type': "card", 'value': 2},
        {'name': "sound", 'description': "-2 value to opponent's equipped card", 'type': "card", 'value': -2},
    ],
    [Elements.WATER]: [
        {'name': "plant", 'description': "+2 value to your equipped card", 'type': "card", 'value': 2},
        {'name': "steam", 'description': "-2 value to opponent's equipped card", 'type': "card", 'value': -2},
    ],
    [Elements.EARTH]: [
        {'name': "metal", 'description': "+2 value to your equipped card", 'type': "card", 'value': 2},
        {'name': "sand", 'description': "-2 value to opponent's equipped card", 'type': "card", 'value': -2},
    ]
}

export class Frog {

};

const CARD_SCALE = 0.0625;
const CARD_SIZE = 64;
const GAP = 16;

export class Player {
    constructor(name, frog, scene, x, y, equipX, equipY = SCREEN_HEIGHT/2, handSize = 7) {
        this.name = name;
        // this.avatar = avatar;
        this.scene = scene;
        this.deck = this.#createStartingDeck(scene);
        this.handSize = handSize;
        this.hand = [];
        for (let i = 0; i < this.handSize; i++) {
            this.drawCard();
        }
        this.collection = [
            { [Elements.FIRE]: 0, [Elements.AIR]: 0, [Elements.WATER]: 0, [Elements.EARTH]: 0 },
            { [Elements.FIRE]: 0, [Elements.AIR]: 0, [Elements.WATER]: 0, [Elements.EARTH]: 0 },
            { [Elements.FIRE]: 0, [Elements.AIR]: 0, [Elements.WATER]: 0, [Elements.EARTH]: 0 },
            { [Elements.FIRE]: 0, [Elements.AIR]: 0, [Elements.WATER]: 0, [Elements.EARTH]: 0 }
        ];
        this.coins = 0;
        this.equipped = null;
        this.equipX = equipX;
        this.equipY = equipY;
        this.character = scene.add.image(x,y,frog).setScale(0.05);
        this.moves = 0;
    }

    getMoves() {
        return this.moves
    }

    setMoves(amt) {
        this.moves = amt;
    }

    modifyMoves(amt) {
        this.moves += amt;
    }

    moveCharacter(x,y) {
        this.character.setPosition(x,y);
    }

    getCharacterPos() {
        return [this.character.x,this.character.y]
    }

    setCharacterVisible(visible) {
        this.character.setVisible(visible);
    }

    #createCard(scene, value, element, direction, x = 0, y = 0) {
        let baseNum = scene.add.image(0,0,'card-'+value.toString()).setScale(CARD_SCALE);
        let elementIcon = scene.add.image(0,0,'card-'+element).setScale(CARD_SCALE);
        let directionMarker = scene.add.image(0,0,'card-'+direction).setScale(CARD_SCALE);

        let cardGroup = scene.add.container(x, y).setData({
            "value": value,
            "element": element,
            "direction": direction
        }).setVisible(false);
        cardGroup.add([baseNum, elementIcon, directionMarker]);

        cardGroup.baseNum = baseNum;

        return cardGroup;
    };

    #createStartingDeck(scene) {
        let deck = [];
        const elements = [Elements.FIRE, Elements.AIR, Elements.WATER, Elements.EARTH];
        const directions = [Directions.NORTH, Directions.EAST, Directions.SOUTH, Directions.WEST];
        
        for (let value = 2; value <= 8; value++) {
            for (let element of elements) {
                for (let direction of directions) {
                    let card = this.#createCard(scene,value,element,direction);
                    deck.push(card);
                }
            }
        }
        return deck;
    }

    drawCard() {
        if (this.deck.length > 0 && this.hand.length < this.handSize) {
            // console.log(this.name + " is drawing card...");
            const randomIndex = Math.floor(Math.random() * this.deck.length);
            const drawnCard = this.deck.splice(randomIndex, 1)[0];
            this.hand.push(drawnCard);
        }
    }

    equipCard(card) {
        const i = this.hand.indexOf(card);
        if (i > -1) {
            card.setPosition(this.equipX,this.equipY);
            this.equipped = card;
            this.hand.splice(i,1);
            this.drawCard();
        } else {
            console.error("Cannot equip card that is not in hand.")
        }
    }

    unequip() {
        this.deck.push(this.equipped);
        this.equipped.setVisible(false);
        this.equipped = null;
    }

    renderHand(x, y, clickable) {
        // console.log(`${this.name} - rendering hand at (${x},${y})`);

        const totalWidth = this.handSize * CARD_SIZE + (this.handSize - 1) * GAP;
        const startX = x - totalWidth / 2;

        for (let i = 0; i < this.handSize; i++) {
            let cardX = startX+i*(CARD_SIZE+GAP)+CARD_SIZE/2;
            let card = this.hand[i];
            card.setPosition(cardX, y);
            card.setVisible(true);

            if (clickable) {
                card.baseNum.setInteractive();
                card.baseNum.on('pointerdown', () => {
                    console.log("Card clicked:", card.getData("value"), card.getData("element"), card.getData("direction"));
                    if (!this.equipped) {
                        this.equipCard(card);
                    } else {
                        console.log("p1 already has a card equipped");
                    }
                });
            } else {
                card.baseNum.disableInteractive();
            }
        }
    }

    decreaseHand() {
        if (this.handSize > 2) {
            this.handSize--;
        }
    }

    increaseHand() {
        if (this.handSize < 10) {
            this.handSize++;
        }
    }
    
    collectCard(card) {
        const directionToNum = {
            [Directions.NORTH]: 0,
            [Directions.EAST]: 1,
            [Directions.SOUTH]: 2,
            [Directions.WEST]: 3,
        }
        console.log(`${this.name} collected ${card}!`);
        this.collection[directionToNum[card.getData("direction")]][card.getData("element")] = 1;
    }
    
    renderCollection(x, y, textDirection, squareSize = 48) {
        // x, y is the middle of where the boxes will be rendered
        // textdirection = 0 means text will be under box, 1 means text will be above
        // squaresize is the size of one 2x2 direction box
        const totalWidth = 4 * squareSize + 3 * GAP;
        const startX = x - totalWidth / 2;
        const squareY = y - squareSize / 2;

        this.collectionObjects = []; 

        const directions = ["N","E","S","W"];

        for (let i = 0; i < 4; i++) {
            let text;
            console.log(y + squareSize/2 + 4, y - squareSize/2 - 4);
            if (textDirection == 0) {
                text = this.scene.add.text(startX + (squareSize + GAP) * i + squareSize/2, y + squareSize/2 + 4, directions[i], {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    color: '#000000',
                    align: 'center'
                }).setOrigin(0.5,0);
            } else {
                text = this.scene.add.text(startX + (squareSize + GAP) * i + squareSize/2, y - squareSize/2 - 4, directions[i], {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    color: '#000000',
                    align: 'center'
                }).setOrigin(0.5,1);
            }
            
            this.collectionObjects.push(text);

            const squares = this.createFourSquare(
                startX + (squareSize + GAP) * i, 
                squareY, 
                squareSize, 
                this.collection[i]
            );

            Object.values(squares).forEach(square => this.collectionObjects.push(square));
        }
    }
    
    destroyCollection() {
        this.collectionObjects.forEach(obj => {
            if (obj && obj.destroy) obj.destroy();
        });
        this.collectionObjects = [];
    }

    createFourSquare(x, y, squareSize, fills, border = 2) {
        const rectSize = squareSize / 2;

        const fireFill = fills[Elements.FIRE] ? 0xa02020 : 0xffffff;
        const airFill = fills[Elements.AIR] ? 0xc0c020 : 0xffffff;
        const waterFill = fills[Elements.WATER] ? 0x2020a0 : 0xffffff;
        const earthFill = fills[Elements.EARTH] ? 0x20a020 : 0xffffff;

        let fourSquare = {
            [Elements.FIRE]: this.#createSquare(x, y, rectSize, border, fireFill), //0xff0000 red
            [Elements.AIR]: this.#createSquare(x + rectSize, y, rectSize, border, airFill), //0xffff00 yellow
            [Elements.WATER]: this.#createSquare(x, y + rectSize, rectSize, border, waterFill), //0x0000ff blue
            [Elements.EARTH]: this.#createSquare(x + rectSize, y + rectSize, rectSize, border, earthFill) //0x00ff00 green
        };

        return fourSquare;
    }

    #createSquare(x, y, size, border, fill) {
        let graphics = this.scene.add.graphics();

        graphics.lineStyle(border, 0x000000, 1.0);
        graphics.fillStyle(fill, 1.0);
        graphics.fillRect(x, y, size, size);
        graphics.strokeRect(x, y, size, size);

        return graphics;
    }

    modifyCoins(amount) {
        this.coins += amount;
    }

    checkWin() {
        // console.log(`checking if ${this.name} has won`);
        // console.log(this.collection);
        let avatarWin = this.collection.some(item => 
            item[Elements.FIRE] === 1 &&
            item[Elements.AIR] === 1 &&
            item[Elements.WATER] === 1 &&
            item[Elements.EARTH] === 1
        );
        if (avatarWin) {
            console.log("won by mastering the X style of all 4 elements");
        }
        let masterWin = false;
        for (let e of Object.values(Elements)) {
            if (this.collection.every(item => item[e] === 1)) {
                console.log("won by mastering all styles of ",e);
                masterWin = true;
                break;
            }
        }
        return avatarWin || masterWin;
    }
}



export function Fight(p1,p2,spaceElement) {
    const losesAgainst = {
        [Elements.AIR]: Elements.FIRE,
        [Elements.FIRE]: Elements.WATER,
        [Elements.WATER]: Elements.EARTH,
        [Elements.EARTH]: Elements.AIR
    };
    const winsAgainst = {
        [Elements.WATER]: Elements.FIRE,
        [Elements.EARTH]: Elements.WATER,
        [Elements.AIR]: Elements.EARTH,
        [Elements.FIRE]: Elements.AIR
    };

    let c1 = p1.equipped;
    let c2 = p2.equipped;

    console.log("fight!");
    console.log("p2 card:", c2.getData("value"), c2.getData("element"), c2.getData("direction"));

    if (!c1) {
        return c2;
    }
    if (c1.getData("element") == c2.getData("element")) {
        if (c1.getData("value") == c2.getData("value")) {
            return null;
        } else {
            return c1.getData("value") > c2.getData("value") ? p1 : p2;
        }
    }
    if (c1.getData("element") == spaceElement) {
        return losesAgainst[spaceElement] == c2.getData("element") ? p2 : p1;
    } else if (c2.getData("element") == spaceElement) {
        return losesAgainst[spaceElement] == c1.getData("element") ? p1 : p2;
    }
    if (winsAgainst[c1.getData("element")] == c2.getData("element")) {
        return p1;
    } else if (winsAgainst[c2.getData("element")] == c1.getData("element")) {
        return p2;
    }
    if (spaceElement == Elements.ALL) { // for all element space, winner is higher value
        if (c1.getData("value") == c2.getData("value")) {
            return null
        }
        return c1.getData("value") > c2.getData("value") ? p1 : p2;
    }
    return null;
}