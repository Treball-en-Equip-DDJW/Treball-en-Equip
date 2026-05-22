// Variable global per guardar el nom del jugador actual i la seva puntuació entre escenes
let dadesPartida = {
    alias: '',
    puntuacio: 0
}



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

// ESCENA DEL MENÚ PRINCIPAL
class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.add.text(400, 150, 'ALIEN KILLER', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
        
        // Boto Jugar
        let botoJugar = this.add.text(400, 300, 'JUGAR', { fontSize: '32px', fill: '#0f0' }).setOrigin(0.5).setInteractive({ useHandCursor: true});
        botoJugar.on('pointerdown', () => {
            this.scene.start('AliasInput');
        });

        // Boto Leaderboard
        let botoLeaderboard = this.add.text(400, 380, 'RANKING', { fontSize: '32px', fill: '#0cf' }).setOrigin(0.5).setInteractive({ useHandCursor: true});
        botoLeaderboard.on('pointerdown', () => {
            this.scene.start('LeaderboardScene');
        });

        // Boto Sortir
        let botoSortir = this.add.text(400, 460, 'SORTIR', { fontSize: '32px', fill: '#f00' }).setOrigin(0.5).setInteractive({ useHandCursor: true});
        botoSortir.on('pointerdown', () => {
           if(confirm("Sortir del joc?")) {
                window.close();
                //Per si el navegador bloqueja windows close
                this.add.text(400, 550, 'Has sortit del joc.', { fill: '#aaa'}).setOrigin(0.5);
           }
        });
    }
}

// ESCENA PER DEMANAR L'ÀLIAS (Base)
class AliasInput extends Phaser.Scene {
    constructor() {
        super('AliasInput');
    }
    create() {
        this.add.text(400, 200, 'INTRODUEIX EL TEU NOM:', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        
        // Creem un input HTML en format text perque es vegi be
        let inputHtml = `
            <input type="text" id="campAlias" placeholder="..."
            style="font-size: 24px; padding: 10px; width: 250px; text-align: center; 
            border-radius: 5px; border: none; outline: none;">
        `;

        // Fem servir el dom de phaser per afegir l'input al mig de la pantalla
        let inputElement = this.add.dom(400, 300).createFromHTML(inputHtml);
        
        // Boto per començar la partida
        let botoComençar = this.add.text(400, 450, 'COMENÇAR', { fontSize: '28px', fill: '#fff', backgroundColor: '#333' }).setOrigin(0.5).setPadding(10).setInteractive({ useHandCursor: true});
        botoComençar.on('pointerdown', () => {
            // Un cop es clica el botó, agafem l'element HTML per la seva ID i extraiem el valor
            let valorAlias = document.getElementById('campAlias').value;
            // Comprovem si està buit per posar Anònim per defecte
            if (valorAlias.trim() === '') {
                dadesPartida.alias = 'Anònim';
            } else {
                dadesPartida.alias = valorAlias;
            }

            dadesPartida.puntuacio = 0; // Reiniciem la puntuació per a la nova partida
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
        // Configuració basica del joc i hud
        this.tempsRestant = 60; // Segons, un minut de partida
        dadesPartida.puntuacio = 0; // Punts inicials

        this.textPunts = this.add.text(20, 20, `Punts: ${dadesPartida.puntuacio}`, { fontSize: '24px', fill: '#fff' });
        this.textTemps = this.add.text(650, 20, `Temps: ${this.tempsRestant}s`, { fontSize: '24px', fill: '#fff' });    
        this.add.text(20, 560, 'Pressiona ESC per pausar', { fontSize: '16px', fill: '#aaa' });

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

        // Destruim els aliens que surtin de la pantalla
        this.aliensGroup.getChildren().forEach((alien) => {
            if (alien.y > 650 || alien.y < -50 || alien.x > 850 || alien.x < -50) {
                alien.destroy();
            }
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
        let tipus = 1; // Per defecte l'alien d'1 punt
        let color = 0x00ff00; // Verd
        let mida = 25;
        let multiplicadorVelocitat = 1;

        if (probabilitat > 60 && probabilitat <= 90) { // 30% alien mitjà
            tipus = 3; color = 0xffff00; mida = 20; multiplicadorVelocitat = 1.8; // Groc
        } else if (probabilitat > 90) { // 10% alien difícil
            tipus = 5; color = 0xff0000; mida = 15; multiplicadorVelocitat = 3; // Vermell
        }

        // Calculem la velocitat base, que es 100, multiplicada per tipus d'alien
        let velBase = 100 * multiplicadorVelocitat;

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

        // Creem l'alien físic que de moment serà un cercle
        let alien = this.add.circle(x, y, mida, color);
        this.physics.add.existing(alien);
        this.aliensGroup.add(alien);
        // Velocitat al cos
        alien.body.setVelocity(velocitatX, velocitatY);
        // Que sigui clicable
        alien.setInteractive();
        // El que passa quan el disparem
        alien.on('pointerdown', () => {
            dadesPartida.puntuacio += tipus; // Sumem punts segons el tipus d'alien
            this.textPunts.setText(`Punts: ${dadesPartida.puntuacio}`);

            // Efecte visual simple de moment per deixar clar que l'hem encertat
            let explosio = this.add.circle(alien.x, alien.y, mida + 5, 0xffffff);
            this.time.delayedCall(100, () => { explosio.destroy(); }); // Destruïm l'explosió després de 100ms
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
        this.add.text(400, 250, 'JOC PAUSAT', { fontSize: '48px', fill: '#ff0' }).setOrigin(0.5);

        let botoContinuar = this.add.text(400, 380, 'CONTINUAR', { fontSize: '28px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true});
        botoContinuar.on('pointerdown', () => {
            this.scene.resume('PlayGame');
            this.scene.stop();
        });
    }
}

// ESCENA DE GAME OVER (PANTALLA FINAL)
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.add.text(400, 150, 'PARTIDA ACABADA', { fontSize: '48px', fill: '#f00' }).setOrigin(0.5);
        this.add.text(400, 230, `Jugador: ${dadesPartida.alias}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 280, `Puntuació: ${dadesPartida.puntuacio} punts`, { fontSize: '32px', fill: '#0f0' }).setOrigin(0.5);

        // Guardar la puntuació pel leaderboard de manera local
        this.guardarPuntuacio(dadesPartida.alias, dadesPartida.puntuacio);

        // Boto per tornar al menú
        let botoMenu = this.add.text(400, 400, 'TORNAR AL MENÚ', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true});
        botoMenu.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
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
        this.add.text(400, 100, 'TOP 5 PUNTUACIONS', { fontSize: '40px', fill: '#0cf' }).setOrigin(0.5);

        // Agafem el leaderboard de la memòria del navegador
        let leaderboard = JSON.parse(localStorage.getItem('alien_killer_leaderboard')) || [];

        // Mostrem les puntuacions
        if (leaderboard.length === 0) {
            this.add.text(400, 300, 'No hi ha partides registrades.', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);
        } else {
            leaderboard.forEach((element, index) => {
                let textPuntuacio = `${index + 1}. ${element.nom} - ${element.puntuacio} punts`;
                this.add.text(400, 200 + index * 40, textPuntuacio, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
            });
        }

        // Boto enrere
        let botoEnrere = this.add.text(400, 500, 'TORNAR', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true});
        botoEnrere.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}

// Unim totes les escenes a la configuració del joc
config.scene = [MainMenu, AliasInput, PlayGame, PauseMenu, GameOverScene, LeaderboardScene];
const game = new Phaser.Game(config);