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
        //De moment fem servir un prompt de JavaScript
        //Mes endavant crearem un input de text que es vegi maco a la pantalla
        let aliasTreball = prompt("Introdueix el teu nom:", "Jugador1");
        if(aliasTreball === null || aliasTreball.trim() === "") {
            dadesPartida.alias = "Ànonim";
        } else {
            dadesPartida.alias = aliasTreball;
        }

        let botoComencar = this.add.text(400, 450, 'COMENÇAR', { fontSize: '28px', fill: '#fff', backgroundColor: '#333' }).setOrigin(0.5).setPadding(10).setInteractive({ useHandCursor: true});
        botoComencar.on('pointerdown', () => {
            dadesPartida.puntuacio = 0; // Reset de punts abans de començar la partida
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
        this.add.text(400, 100, `Jugador: ${dadesPartida.alias}`, { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 250, 'PANTALLA DE JOC', { fontSize: '40px', fill: '#0f0' }).setOrigin(0.5);

        // Text indicatiu de com pausar el joc
        this.add.text(400, 350, 'Tecla ESC per pausar el joc', { fontSize: '20px', fill: '#aaa' }).setOrigin(0.5);

        // Afegim un boto per simular de moment que guanyem punts i anem a GameOver
        let botoSimularFi = this.add.text(400, 450, 'Simular fi de partida (+50 punts)', { fontSize: '20px', fill: '#ff0', backgroundColor: '#333' }).setOrigin(0.5).setInteractive({ useHandCursor: true});
        botoSimularFi.on('pointerdown', () => {
            dadesPartida.puntuacio = 50;
            this.scene.start('GameOverScene');
        });

        // Tecla ESC per pausar el joc
        this.teclaESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    update() {
        // Si es prem ESC, posem l'escena de pausa en paral·lel i pausem aquesta
        if (Phaser.Input.Keyboard.JustDown(this.teclaESC)) {
            this.scene.launch('PauseMenu');
            this.scene.pause();
        }
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