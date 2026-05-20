// Configuració de la partida
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // El joc és a l'espai, no hi ha gravetat
            debug: false
        }
    },
    scene: [] // Afegirem les escenes aquí
};

// ESCENA DEL MENÚ PRINCIPAL
class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.add.text(400, 200, 'ALIEN KILLER', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 400, 'Prem per començar (PROVISIONAL)', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        
        // Al fer clic a la pantalla, anem a la introducció de l'àlias
        this.input.once('pointerdown', () => {
            this.scene.start('AliasInput');
        });
    }
}

// ESCENA PER DEMANAR L'ÀLIAS (Base)
class AliasInput extends Phaser.Scene {
    constructor() {
        super('AliasInput');
    }
    create() {
        this.add.text(400, 300, 'Aquí demanarem l\'Alias\n(Fes clic per anar al joc)', { align: 'center' }).setOrigin(0.5);
        this.input.once('pointerdown', () => {
            this.scene.start('PlayGame');
        });
    }
}

// ESCENA DEL JOC
class PlayGame extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }
    create() {
        this.add.text(400, 300, 'ESCENA DE JOC ACTIVADA', { fill: '#0f0' }).setOrigin(0.5);
    }
}

// Inicialitzem el joc afegint les escenes a la llista
config.scene = [MainMenu, AliasInput, PlayGame];
const game = new Phaser.Game(config);