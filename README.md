# *ALIEN KILLER* - Pol Pastor i Bru Postigo

## Introducció
**Alien Killer** és un joc programat utilitzant el motor de videojocs **Phaser.io v3**, combinat amb HTML, CSS i JavaScript. L'objectiu principal del projecte ha estat crear un bucle de joc simple i entretingut que inclogui gestió d'escenes, interfície d'usuari, algunes físiques bàsiques, i un sistema de guardat de dades locals. 
Una invasió alienígena amenaça en destruir la Terra. S'ha enviat al jugador a una nau espacial per disparar i eliminar els alienígenes abans de que creuin l'atmòsfera terrestre.

## Disseny del joc
El joc s'inspira en mecàniques clàssiques de precisió i reflexos estil "aim-lab". Ens hem inspirat especialment en la tarea d'eliminar meteorits d'Among Us. Les característiques principals del disseny són:
* **Core loop del joc:** El jugador té 60 segons per eliminar el màxim nombre d'àliens possibles fent clic a sobre d'ells mentre es mouen per la pantalla.
* **Corba de dificultat:** A mesura que avança el minut de partida, el temps de generació d'enemics es redueix, apareixent cada cop més i augmentant la dificultat per eliminar-los tots.
* **Tipus d'aliens:** Hi ha 4 tipus amb diferents probabilitats d'aparició i velocitats:
  * **Verd:** Fàcil, lent, 1 punt (50% probabilitat).
  * **Groc:** Mitjà, velocitat normal, 3 punts (30% probabilitat).
  * **Blau:** Penalització, resta 3 punts (10% probabilitat).
  * **Vermell:** Difícil, molt ràpid i petit, 5 punts (10% probabilitat).
* **Interfície:** Menú principal, sistema de registre d'àlias, menú de pausa in-game amb opció d'abandonar la partida, pantalla final i leaderboard amb les 5 millors puntuacions.

## Parts més rellevants de la implementació
* **Gestió d'escenes** Hem separat la lògica en escenes independents (`MainMenu`, `AliasInput`, `PlayGame`, `PauseMenu`, `GameOverScene`, `LeaderboardScene`).
* **Interfície DOM:** Implementació d'un contenidor HTML tipus `<input>` superposat al canvas de Phaser mitjançant `dom: { createContainer: true }` per poder introduir el nom del jugador al joc mateix, evitant l'ús de pop-ups del navegador.
* **Temporitzadors:** Ús de `this.time.addEvent` de Phaser per controlar tant el compte enrere dels 60 segons de la partida com el ritme de generació d'àliens.
* **Físiques i Detecció:** Ús d'Arcade Physics (`this.physics.add.sprite`) per donar velocitat direccional als àliens i `.setInteractive()` per detectar els clics de l'usuari (amb pointerdown).
* **Sistema de guardat:** Ús de `localStorage` per emmagatzemar, ordenar i mostrar el Top 5 de millors puntuacions en aquell dispositiu.
* **Efectes visuals (Tweens):** Creació d'animacions simples per codi (`this.tweens.add`) per als estats de "hover" dels botons i per l'efecte d'explosió i text de puntuació flotant al destruir un àlien.
* **Estètica:** Creació d'una carpeta d'assets amb alguns PNGs per donar vida i estètica a la partida. Els PNG's d'àliens han set generats amb IA, i hem modificat el seu tamany amb Photoshop.

## Conclusions i problemes trobats
Per desenvolupar aquest joc, hem seguit la ruta que habíem establert amb les issues de GitHub, però fent primer les funcionalitats bàsiques i imprescindibles, per més endavant acabar tot l'apartat estètic.
* **Problemes trobats:** 
  * Dimensions dels PNGs: Vam trobar problemes a l'hora d'importar les imatges, ja que eren massa grans per al canvas de 800x600. Ho hem solucionat redimensionant els fitxers originals amb Photoshop per optimitzar el rendiment.
  * Conflictes d'estat a les animacions: El joc es congelava al disparar el primer àlein, degut a intentar destruir instàncies que ja no existien en finalitzar certes animacions (`onComplete`). Ho vam solucionar repassant les funcions de callback.
* **Conclusions:** El projecte, a part de ser divertit, ens ha servit per entendre a fons com es desenvolupa un joc en Phaser 3, la importància de gestionar correctament la memòria i l'impacte d'una bona UX (com permetre cancel·lar partides o tenir camps de text integrats).

---
## MANUAL D'USUARI
**Com començar a jugar:**
1. Obre el joc al teu navegador.
2. Al Menú Principal, clica a **JUGAR**.
3. Introdueix el teu àlias a la caixa de text i clica **COMENÇAR**. Si el deixes buit, jugaràs com a "Anònim".

**Controls del joc:**
* **Ratolí:** Mou el ratolí per controlar la mirilla.
* **Clic Esquerre:** Dispara a la ubicació de la mirilla.
* **Tecla ESC:** Pausa la partida en qualsevol moment. Des d'allà pots continuar o abandonar per tornar al menú.

**Objectiu i Puntuació:**
La partida dura exactament 60 segons. El teu objectiu és aconseguir la màxima puntuació disparant als àliens que creuen la pantalla.
* Dispara a l'àlien **Verd (+1)**, **Groc (+3)** i **Vermell (+5)**.
* Si dispares a l'àlien **Blau**, se't restaran **3 punts**!

Si aconsegueixes una bona puntuació, el teu nom quedarà registrat a l'apartat **RANKING** del menú principal.
