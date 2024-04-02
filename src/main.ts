import { preloadSkins } from "./utils/Skins";
import GameSettingsPage from "./ui/GameSettingsPage";
import SettingsDB from "./server/GlobalSettingsDB";
import GameSettings from "./models/GameSettings";
import SettingsPage from "./ui/SettingsPage";
import RankingPage from "./ui/RankingPage";
import RankingDB from "./server/RankingDB";
import Random from "./utils/Random";
import Player from "./Player";
import Game from "./Game";
import UI from "./ui/UI";
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
const game = new Game(canvas);
const player = new Player(canvas);

document.querySelector("#playNow")?.addEventListener("click", () => {
    console.log('Emitting playNow');
    socket.emit('playNowSolo');
});

socket.on('gameStarted', () => {
    console.log('Game started');
    
});

// This callback gets called every single that
// that the player loses a health point.
// There is a parameter that can be used to
// customise the game's behaviour when the player
// dies.
player.onPlayerHit((hp: number) => {
    UI.removeHeart();
    if (hp == 0) {
        UI.showDeathScreen();
        setTimeout(() => {
            UI.hideDeathScreen();
            UI.showUI();
        }, 2000);
    }
});

let playing = false;
let loadingAssets = true;

// Allow the button to be interactive.
// Without it, the buttons wouldn't work.
UI.bindEvents();

// Fetch the rankings from the database.
const rankings = RankingDB.fetchRankingsAndScores();

// Display that into the ranking table.
// Even if the data is empty, the initWith()
// method has to be called.
RankingPage.initWith(rankings);

SettingsPage.initWith(SettingsDB.cloned);
SettingsPage.listenToNameChange((newName) => SettingsDB.name = newName);
SettingsPage.listenToEffectsVolumeChange((newVolume) => SettingsDB.effectsVolume = newVolume);
SettingsPage.listenToMusicVolumeChange((newVolume) => SettingsDB.musicVolume = newVolume);
SettingsPage.listenToSkinChange((newSkin) => SettingsDB.skin = newSkin);

GameSettingsPage.initDefaultGameSettings();
GameSettingsPage.onGameStarted(() => {
    if (!loadingAssets) {
        Game.random = new Random(GameSettings.seed === -1 ? new Date().getTime() : GameSettings.seed);
        player.setSkin(SettingsDB.skin);
        player.useLastGameSettings();
        player.placeAtStartingPosition(); // call it after changing the skin
        playing = true;
        game.addEntity(player);
        initializeHealthPoints(player.getHealth());
        UI.hideUI();
    }
});

async function preloadAssets() {
    try {
        await preloadSkins();
        // Initializes the player with its skin.
        // It's important to do it here because as of now
        // the player doesn't have a loaded skin.
        player.setSkin(SettingsDB.skin);
    } catch (e) {
        console.error(e);
        alert("Quelques skins n'ont pas pu être chargés correctement.");
    }
    loadingAssets = false;
}

function initializeHealthPoints(hp: number) {
    for (let i = 0; i < hp; i++) {
        UI.createHeart();
    }
}

function calculateGameLimits(canvas: HTMLCanvasElement, bordersUI: typeof UI.gameBorders): GameLimits {
    return {
        minY: 0,
        minX: bordersUI.left.getBoundingClientRect().width,
        maxX: canvas.width - bordersUI.right.getBoundingClientRect().width,
        maxY: canvas.height,
    }
}

function fillScreen() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    Game.limits = calculateGameLimits(canvas, UI.gameBorders);
}

// Add event listener, if window is being moved, resize canva height et width
window.addEventListener("resize", () => fillScreen());
window.addEventListener("load", () => fillScreen());

// _process
function render() {
    if (playing) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        game.updateRender();
        UI.setScore(game.getScore());
    }
    requestAnimationFrame(render);
}

// _physics_process
setInterval(() => {
    if (playing) {
        game.updateMove();
        game.updateMonsterSpawn();
        if (game.gameOver()) {
            playing = false;
            game.reset();
        }
    }
}, 1000 / 60);

// The order in which those two
// functions are called do not matter.
preloadAssets();
render();
