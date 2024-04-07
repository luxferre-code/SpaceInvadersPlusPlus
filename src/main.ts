import { io } from 'socket.io-client';
import { preloadSkins } from "./utils/Skins";
import GameSettingsPage from "./ui/GameSettingsPage";
import SettingsDB from "./db/GlobalSettingsDB";
import SettingsPage from "./ui/SettingsPage";
import RankingPage from "./ui/RankingPage";
import RankingDB from "./db/RankingDB";
import PlayerClient from './PlayerClient';
import LobbyPage from "./ui/LobbyPage";
import GameClient from './GameClient';
import UI from "./ui/UI";

const socket = io(`${window.location.hostname}:3000`);

socket.on('connect', () => {
    console.log('Connected to server as', socket.id);
});

socket.on('disconnect', () => {
    globalGameData = undefined;
    LobbyPage.disconnect();
    console.log('Disconnected from server');
});

// Send to the server the username of the current user
socket.emit("username_changed", SettingsDB.name);

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
GameClient.initWith(canvas);

let loadingAssets = true;
let globalGameData: GameData | undefined = undefined;
PlayerClient.initConnection(socket);

function isInGame() {
    return globalGameData != undefined;
}

LobbyPage.bindEvents(socket);
LobbyPage.setOnGameStarted((gameData: GameData) => {
    globalGameData = gameData;
    PlayerClient.setPlayerData(gameData.players.find(p => p.id === socket.id)!, gameData.settings.playerShootDelay);
    UI.hideUI();
});

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
SettingsPage.listenToEffectsVolumeChange((newVolume) => SettingsDB.effectsVolume = newVolume);
SettingsPage.listenToMusicVolumeChange((newVolume) => SettingsDB.musicVolume = newVolume);
SettingsPage.listenToSkinChange((newSkin) => SettingsDB.skin = newSkin);
SettingsPage.listenToNameChange((newName) => {
    SettingsDB.name = newName;
    socket.emit("username_changed", newName);
});

GameSettingsPage.initDefaultGameSettings();
GameSettingsPage.onGameStarted(() => {
    if (!loadingAssets) {
        // player.setSkin(SettingsDB.skin);
        // player.useLastGameSettings();
        // player.placeAtStartingPosition(); // call it after changing the skin
        // playing = true;
        // game.addEntity(player);
        // initializeHealthPoints(player.getHealth());
        // UI.hideUI();
    }
});

async function preloadAssets() {
    try {
        await preloadSkins();
    } catch (e) {
        alert("Quelques skins n'ont pas pu être chargés correctement.");
    }
    loadingAssets = false;
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
    GameClient.limits = calculateGameLimits(canvas, UI.gameBorders);
    if (LobbyPage.isConnected()) {
        socket.emit("screen_resized", LobbyPage.getRoomId(), GameClient.limits);
    }
}

window.addEventListener("resize", () => fillScreen());
window.addEventListener("load", () => fillScreen());

window.addEventListener("keydown", (e) => {
    if (isInGame() && (e.key === "Esc" || e.key === "Escape")) {
        if (globalGameData!.paused) {
            if (globalGameData!.paused_by === socket.id) {
                unpause();
                UI.hidePauseMenu();
            }
        } else {
            UI.pauseGame(SettingsDB.name, true);
            // It has to be assigned here to make sure
            // we can detect if the pause was triggered by
            // this client, or another one.
            globalGameData!.paused = true;
            socket.emit("game_pause_toggled", socket.id);
        }
    }
});

function unpause() {
    socket.emit("game_pause_toggled");
}

UI.onUnpause(unpause);
UI.onQuitGame(() => {
    socket.emit("quit_game");
});

function render() {
    if (isInGame()) {
        GameClient.getContext().clearRect(0, 0, canvas.width, canvas.height);
        globalGameData!.players.forEach(p => GameClient.renderPlayer(p));
        globalGameData!.bullets.forEach(b => GameClient.renderBullet(b.x, b.y));
        globalGameData!.enemies.forEach(e => GameClient.renderEnemy(e.x, e.y));
    }
    requestAnimationFrame(render);
}

socket.on("game_update", (game: GameData) => {
    if (globalGameData?.score != game.score) {
        UI.setScore(game.score);
    }
    if (globalGameData?.paused === false && game.paused) {
        // Executes if the client's game isn't paused
        // but another player paused it
        UI.pauseGame(game.players.find(p => p.id === game.paused_by)!.username, false);
    } else if (globalGameData?.paused === true && !game.paused) {
        // Executes if the client's game is paused,
        // but another player unpaused it.
        // It can only be unpaused by the one that paused it
        // initially, therefore we can safely assume here that
        // the pauser unpaused the game.
        UI.hidePauseMenu();
    }
    globalGameData = game;
    if (globalGameData.players.every(p => p.hp <= 0)) {
        UI.showDeathScreen();
        setTimeout(() => {
            UI.hideDeathScreen();
        }, 2000);
        socket.emit("game_ended");
    }
});

setInterval(() => {
    if (isInGame() && !globalGameData!.paused) {
        const player = globalGameData!.players.find(p => p.id === socket.id)!;
        if (player.hp > 0) {
            PlayerClient.move();
            socket.emit("player_moved", PlayerClient.getPosition());
        }
    }
}, 1000 / 60);

// The order in which those two
// functions are called do not matter.
preloadAssets();
render();
