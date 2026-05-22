// Variable global per guardar el nom del jugador actual i la seva puntuació entre escenes
let dadesPartida = {
    alias: '',
    puntuacio: 0
}

// Configuració d'estils per defecte als textos
const ESTIL_TITOL = { fontSize: '64px', fill: '#0cf', stroke: '#000', strokeThickness: 6 };
const ESTIL_TEXT = { fontSize: '24px', fill: '#fff' };
const ESTIL_BOTO = { fontSize: '28px', fill: '#fff' };

// Configuració de la partida
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    dom: {
        createContainer: true // Per afegir elements HTML per sobre el canvas
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // El joc és a l'espai, no hi ha gravetat
            debug: false
        }
    },
    scene: [] // Afegirem les escenes aquí
};

// Funció d'ajuda per crear botons estètics uniformes
function crearBotoEstetic(scene, x, y, text, callback, colorTipus = '#fff') {
    // Creem un contenidor per agrupar la imatge de fons i el text
    let botoContainer = scene.add.container(x, y);
    // Imatge de fons del botó
    let fonsBoto = scene.add.image(0, 0, 'botoImg').setInteractive({ useHandCursor: true });
    fonsBoto.setDisplaySize(200, 60); // Ajustem la mida del botó
    // Text del botó
    let textBoto = scene.add.text(0, 0, text, { ...ESTIL_BOTO, fill: colorTipus }).setOrigin(0.5);
    // Afegim els elements al container
    botoContainer.add([fonsBoto, textBoto]);
    fonsBoto.on('pointerover', () => {
        scene.tweens.add({
            targets: botoContainer,
            scale: 1.1,
            duration: 100,
            ease: 'Power1'
        });
    });
    fonsBoto.on('pointerout', () => {
        scene.tweens.add({
            targets: botoContainer,
            scale: 1.0,
            duration: 100,
            ease: 'Power1'
        });
    })
    fonsBoto.on('pointerdown', callback);
    return botoContainer;
}


// ESCENA DEL MENÚ PRINCIPAL
class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        // Carreguem els assets
        this.load.setBaseURL('./');
        this.load.image('fonsEspai', 'assets/fons_joc.png');
        this.load.image('botoImg', 'assets/boto.png');
        this.load.image('explosioImg', 'assets/explosio.png');
        this.load.image('alienverd', 'assets/alienverd.png');
        this.load.image('aliengroc', 'assets/aliengroc.png');
        this.load.image('alienblau', 'assets/alienblau.png');
        this.load.image('alienvermell', 'assets/alienvermell.png');
    }

    create() {
        // Titol amb estil
        this.add.text(400, 150, 'ALIEN KILLER', ESTIL_TITOL).setOrigin(0.5);
        // Botons amb la funció
        crearBotoEstetic(this, 400, 320, 'JUGAR', () => { this.scene.start('AliasInput'); }, '#0cf');
        crearBotoEstetic(this, 400, 410, 'RANKING', () => { this.scene.start('LeaderboardScene'); }, '#000');
        crearBotoEstetic(this, 400, 500, 'SORTIR', () => {
            if (confirm("Sortir del joc?")) {
                window.close();
            }
        }, '#000');
    }
}

// ESCENA PER DEMANAR L'ÀLIAS (Base)
class AliasInput extends Phaser.Scene {
    constructor() {
        super('AliasInput');
    }
    create() {
        this.add.text(400, 200, 'INTRODUEIX EL TEU NOM:', ESTIL_TEXT).setOrigin(0.5);
        
        // Creem un input HTML en format que aplica AstroFont
        let inputHtml = `
            <input type="text" id="campAlias" placeholder="Escriu aquí..." 
            style="font-size: 24px; padding: 10px; width: 250px; text-align: center; border-radius: 5px; border: 2px solid #fff; background: rgba(0,0,0,0.5); color: #fff; outline: none;">
        `;

        this.add.dom(400, 300).createFromHTML(inputHtml);
        
        // Boto per començar la partida
        crearBotoEstetic(this, 400, 420, 'COMENÇAR', () => {
            let campAlias = document.getElementById('campAlias').value;
            dadesPartida.alias = (campAlias.trim() === '') ? "Anònim" : campAlias;
            dadesPartida.puntuacio = 0; // Reiniciem la puntuació per a la nova partida
            this.scene.start('PlayGame');
        }, '#000');

        // Boto per tornar al menú
        crearBotoEstetic(this, 400, 500, 'TORNAR', () => {
            this.scene.start('MainMenu');
        }, '#000');
    }
}

// ESCENA DEL JOC
class PlayGame extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }
    create() {
        // Imatge de fons del joc
        this.add.image(400, 300, 'fonsEspai').setOrigin(0.5).setAlpha(0.8); // Fons amb una mica de transparència per destacar els elements del joc
        // Configuració basica del joc i hud
        this.tempsRestant = 60; // Segons, un minut de partida
        dadesPartida.puntuacio = 0; // Punts inicials
        this.textPunts = this.add.text(20, 20, `Punts: ${dadesPartida.puntuacio}`, ESTIL_TEXT);
        this.textTemps = this.add.text(650, 20, `Temps: ${this.tempsRestant}s`, ESTIL_TEXT);
        this.add.text(20, 560, 'ESC: Pausar', ESTIL_TEXT);

        // Configuracion de la mirilla
        this.input.setDefaultCursor('none'); // Amaguem el cursor del ratolí

        //Creem una mirilla simple, un cercle blanc amb un punt al mig
        this.mirilla = this.add.graphics();
        this.mirilla.lineStyle(2, 0xffffff, 1);
        this.mirilla.strokeCircle(0, 0, 15);
        this.mirilla.fillStyle(0xff0000, 1);
        this.mirilla.fillCircle(0, 0, 2);
        this.mirilla.setDepth(100); // La mirilla ha d'estar per sobre de qualsevol cosa

        // Grup d'aliens i físiques
        this.aliensGroup = this.physics.add.group();

        // Timer pel compte enrere
        this.timerPartida = this.time.addEvent({
            delay: 1000, // Cada segon
            callback: this.actualitzarTemps,
            callbackScope: this,
            loop: true
        });

        // Timer de generació d'aliens, que començarà generant un cada 500ms i anirà augmentant la dificultat a mesura que avança la partida
        this.delaySpawn = 500;
        this.timerSpawn = this.time.addEvent({
            delay: this.delaySpawn,
            callback: this.generarAlien,
            callbackScope: this,
            loop: true
        });

        // Tecla ESC per pausar el joc
        this.teclaESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Hem de recuperar el cursor quan es pausa el joc
        this.events.on('pause', () => { this.input.setDefaultCursor('default'); });
        this.events.on('resume', () => { this.input.setDefaultCursor('none'); });
    }

    update() {
        // Actualitzem la posició de la mirilla per seguir el cursor
        this.mirilla.x = this.input.activePointer.x;
        this.mirilla.y = this.input.activePointer.y;

        // Si es prem ESC, posem l'escena de pausa en paral·lel i pausem aquesta
        if (Phaser.Input.Keyboard.JustDown(this.teclaESC)) {
            this.scene.launch('PauseMenu');
            this.scene.pause();
        }

        // Rotació d'aliens i eliminació si surten de la pantalla
        this.aliensGroup.getChildren().forEach(alien => {
            alien.angle += alien.velocitatRotacio;
            if (alien.y > 650 || alien.y < -50 || alien.x > 850 || alien.x < -50) { alien.destroy(); }
        });
    }

    actualitzarTemps() {
        this.tempsRestant--;
        this.textTemps.setText(`Temps: ${this.tempsRestant}s`);

        // Augmentem la dificultat del joc reduint el temps entre spawns a mesura q avança la partida
        if (this.tempsRestant % 10 === 0 && this.delaySpawn > 400) {
            this.delaySpawn -= 50; // Spawn més ràpid progressiu
            this.timerSpawn.delay = this.delaySpawn;
        }

        // Final de la partida
        if (this.tempsRestant <= 0) {
            this.input.setDefaultCursor('default'); // Recuperem el cursor
            this.scene.start('GameOverScene');
        }
    }

    generarAlien() {
        // Mirem des de quin costat de la pantalla apareixerà. 0 dalt, 1 dreta, 2 baix i 3 esquerra
        let costat = Phaser.Math.Between(0, 3);
        let x, y, velocitatX, velocitatY;

        // Decidim el tipus d'alien basat en probabilitats
        let probabilitat = Phaser.Math.Between(1, 100);
        
        // Definim els paràmetres buits per omplir segons el tipus d'alien
        let puntsVal, textureClau, velMult, escala;

        if (probabilitat <= 50) { // 50% alien verd fàcil
            puntsVal = 1; textureClau = 'alienverd'; velMult = 1; escala = 1.4; // Verd
        } else if (probabilitat > 50 && probabilitat <= 80) { // 30% alien mitjà
            puntsVal = 3; textureClau = 'aliengroc'; velMult = 1.8; escala = 1.2; // Groc
        } else if (probabilitat > 80 && probabilitat <= 90) { // 10% alien bo (resta punts si el dispares)
            puntsVal = -3; textureClau = 'alienblau'; velMult = 1.5; escala = 1.3; // Blau
        } else if (probabilitat > 90) { // 10% alien difícil
            puntsVal = 5; textureClau = 'alienvermell'; velMult = 3; escala = 1.1; // Vermell
        }

        // Calculem la velocitat base, que es 100, multiplicada per tipus d'alien
        let velBase = 100 * velMult;

        // Assignant les cordenades i direcció fora de la pantalla
        if (costat === 0) { // Dalt
            x = Phaser.Math.Between(50, 750); y = -30;
            velocitatX = Phaser.Math.Between(-50, 50); velocitatY = velBase;
        } else if (costat === 1) { // Dreta
            x = 830; y = Phaser.Math.Between(50, 550);
            velocitatX = -velBase; velocitatY = Phaser.Math.Between(-50, 50);
        } else if (costat === 2) { // Baix
            x = Phaser.Math.Between(50, 750); y = 630;
            velocitatX = Phaser.Math.Between(-50, 50); velocitatY = -velBase;
        } else { // Esquerra
            x = -30; y = Phaser.Math.Between(50, 550);
            velocitatX = velBase; velocitatY = Phaser.Math.Between(-50, 50);
        }

        // Creació de l'sprite
        let alien = this.physics.add.sprite(x, y, textureClau);
        alien.setScale(escala); // Ajustem la mida visualment
        this.aliensGroup.add(alien);

        // Velocitat de rotació per simular que floten
        alien.velocitatRotacio = Phaser.Math.Between(1, 3);
        alien.angle = Phaser.Math.Between(0, 360);
        alien.body.setVelocity(velocitatX, velocitatY);
        alien.setInteractive();
        alien.on('pointerdown', () => {
            dadesPartida.puntuacio = Math.max(0, dadesPartida.puntuacio + puntsVal); // Evitem que la puntuació sigui negativa
            this.textPunts.setText(`Punts: ${dadesPartida.puntuacio}`);

            // Efecte d'explosió
            let explosio = this.add.image(alien.x, alien.y, 'explosioImg');
            explosio.setScale(0.2).setTint((puntsVal < 0) ? 0x0000ff : 0xffffff); // Explosió blava per aliens que resten punts, groga per la resta
            this.tweens.add({
                targets: explosio,
                scale: 1.0,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => explosio.destroy()
            });
            // Indicador de punts que apareix al eliminar l'àlien
            let colorTxt = (puntsVal < 0) ? '#f00' : 'rgb(255, 238, 0)'; // Vermell si resta, groc si suma
            let signe = (puntsVal < 0) ? '' : '+'; // Afegim un signe + per als punts positius
            let txtPopup = this.add.text(alien.x, alien.y, `${signe}${puntsVal}`, {
                ...ESTIL_TEXT, 
                fontSize: '32px', 
                fill: colorTxt, 
                stroke: '#fff', 
                strokeThickness: 2
            }).setOrigin(0.5);

            // Petita animació pq el tex pugi cap a dalt i es difumini
            this.tweens.add({
                targets: txtPopup,
                y: alien.y - 50,
                alpha: 0,
                duration: 1500,
                ease: 'Cubic.easeOut',
                onComplete: () => txtPopup.destroy()
            });
            alien.destroy();
        });
    }
}

// ESCENA MENÚ DE PAUSA
class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
    }

    create() {
        // Fons semi transparent per poder veure el joc de fons
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        this.add.text(400, 250, 'JOC PAUSAT', ESTIL_TITOL).setOrigin(0.5);

        crearBotoEstetic(this, 400, 350, 'CONTINUAR', () => {
            this.scene.resume('PlayGame');
            this.scene.stop();
        }, '#000');

        // Boto per cancelar la partida i sortir al menu
        crearBotoEstetic(this, 400, 450, 'SORTIR', () => {
            if (confirm("Vols sortir de la partida? La teva puntuació no es guardarà.")) {
                this.input.setDefaultCursor('default'); // Recuperem el cursor
                this.scene.stop('PlayGame');
                this.scene.start('MainMenu');
            }
        }, '#f00');
    }
}

// ESCENA DE GAME OVER (PANTALLA FINAL)
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.add.text(400, 150, 'PARTIDA ACABADA', ESTIL_TITOL).setOrigin(0.5).setTint(0xff0000);
        this.add.text(400, 230, `Jugador: ${dadesPartida.alias}`, ESTIL_TEXT).setOrigin(0.5);
        this.add.text(400, 280, `Puntuació: ${dadesPartida.puntuacio} punts`, { ...ESTIL_TEXT, fontSize: '40px', fill: '#0cf' }).setOrigin(0.5);

        // Guardar la puntuació pel leaderboard de manera local
        this.guardarPuntuacio(dadesPartida.alias, dadesPartida.puntuacio);

        // Boto per tornar al menú
        crearBotoEstetic(this, 400, 480, 'MENÚ', () => {
            this.scene.start('MainMenu');
        }, '#000');
    }

    guardarPuntuacio(alias, puntuacio) {
        // Agafem el leaderboard actual o creem un de buit si no existeix
        let leaderboard = JSON.parse(localStorage.getItem('alien_killer_leaderboard')) || [];
        // Afegim la nova partida
        leaderboard.push({nom: alias, puntuacio: puntuacio});
        // Ordenem el leaderboard de major a menor puntuació
        leaderboard.sort((a, b) => b.puntuacio - a.puntuacio);
        // Guardem només les 5 millors puntuacions
        leaderboard = leaderboard.slice(0, 5);
        // Guardem el leaderboard a la memòria del navegador
        localStorage.setItem('alien_killer_leaderboard', JSON.stringify(leaderboard));
    }
}

// ESCENA DE LEADERBOARD
class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super('LeaderboardScene');
    }

    create() {
        this.add.text(400, 100, 'TOP 5 PUNTUACIONS', ESTIL_TITOL).setOrigin(0.5).setTint(0x00ffff);

        // Agafem el leaderboard de la memòria del navegador
        let leaderboard = JSON.parse(localStorage.getItem('alien_killer_leaderboard')) || [];

        // Mostrem les puntuacions
        if (leaderboard.length === 0) {
            this.add.text(400, 300, 'No hi ha partides registrades.', { ...ESTIL_TEXT, fill: '#aaa' }).setOrigin(0.5);
        } else {
            leaderboard.forEach((element, index) => {
                // Fem que el primer sigui daurat
                let color = (index === 0) ? '#ff0' : '#fff';
                let textPuntuacio = `${index + 1}. ${element.nom} - ${element.puntuacio} punts`;
                this.add.text(400, 200 + index * 40, textPuntuacio, { ...ESTIL_TEXT, fill: color }).setOrigin(0.5);
            });
        }

        // Boto enrere
        crearBotoEstetic(this, 400, 520, 'TORNAR', () => {
            this.scene.start('MainMenu');
        }, '#000');
    }
}

// Unim totes les escenes a la configuració del joc
config.scene = [MainMenu, AliasInput, PlayGame, PauseMenu, GameOverScene, LeaderboardScene];
const game = new Phaser.Game(config);