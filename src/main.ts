import { io } from 'socket.io-client';
import { PowerupImages, preloadPowerups } from './utils/Powerups';
import { Skin, getSkinImage, preloadSkins } from "./utils/Skins";
import GameSettingsPage from "./ui/GameSettingsPage";
import GlobalSettingsDB from './db/GlobalSettingsDB';
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

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
GameClient.initWith(canvas);

let loadingAssets = true;
let globalGameData: GameData | undefined = undefined;
PlayerClient.initConnection(socket);

function isInGame() {
    return globalGameData != undefined;
}

function initGame(game_data: GameData) {
    globalGameData = game_data;
    PlayerClient.setPlayerData(game_data.players.find(p => p.id === socket.id)!, game_data.settings.playerShootDelay);
}

LobbyPage.bindEvents(socket);
LobbyPage.setOnGameStarted((game_data: GameData) => {
    if (!loadingAssets) {
        initGame(game_data);
        UI.hideUI();
    }
});

socket.on("game_restarted", (game_data: GameData) => {
    initGame(game_data);
    clearCanvas();
    UI.hideGameOver();
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
    if (LobbyPage.isConnected()) {
        socket.emit("username_changed", newName);
    }
});

GameSettingsPage.initDefaultGameSettings();
GameSettingsPage.onGameStarted(() => {
    if (!loadingAssets) {
        const enemy_skin = getSkinImage(Skin.GREEN);
        const esw = enemy_skin.width;
        const esh = enemy_skin.height;
        const set = GameSettingsPage.settings;
        const lts = GameClient.limits;
        const nam = GlobalSettingsDB.name;
        const ski = GlobalSettingsDB.getSkinInformation();
        const ps = PowerupImages.map((v, i) => ({
            skin: i,
            sw: v.width,
            sh: v.height,
        }));
        socket.emit("start_solo_game", set, lts, nam, ski, esw, esh, ps, (gd: GameData) => {
            initGame(gd);
            UI.hideUI();
        });
    }
});

async function preloadAssets() {
    try {
        await preloadSkins();
        await preloadPowerups();
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
    if (isInGame() && !globalGameData!.is_over && (e.key === "Esc" || e.key === "Escape")) {
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

function quit() {
    globalGameData = undefined;
    LobbyPage.reset();
    PlayerClient.resetControls();
    UI.showUI();
    clearCanvas();
}

UI.onUnpause(unpause);

UI.onQuitGame(() => {
    socket.emit("quit_game");
    quit();
});

UI.onGameOverQuitGame(() => {
    socket.emit("game_ended");
    quit();
});

UI.onRestartGame(() => socket.emit("game_restart"));

function clearCanvas() {
    GameClient.getContext().clearRect(0, 0, canvas.width, canvas.height);
}

function render() {
    if (isInGame()) {
        clearCanvas();
        globalGameData!.powerups.forEach(p => GameClient.renderPowerup(p));
        globalGameData!.players.forEach(p => GameClient.renderPlayer(p));
        globalGameData!.bullets.forEach(b => GameClient.renderBullet(b.x, b.y));
        globalGameData!.enemies.forEach(e => GameClient.renderEnemy(e.x, e.y, e.boss, e.hp));
    }
    requestAnimationFrame(render);
}

socket.on("game_update", (game: GameData) => {
    if (game.is_over) {
        return;
    }
    if (globalGameData?.score != game.score) {
        UI.setScore(game.score);
    }
    if (globalGameData?.paused === false && game.paused) {
        // Executes if the client's game isn't paused
        // but another player paused it. However, since
        // this event gets triggered so fast, it's possible
        // that the client paused the game and that it gets
        // detected here instead of via the event handler.
        UI.pauseGame(game.players.find(p => p.id === game.paused_by)!.username, game.paused_by === socket.id);
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
        socket.emit("game_over");
        UI.showGameOver();
    } else {
        // We want the death screen to appear only in multiplayer.
        // If the player dies in a solo game then the
        // game over screen must be displayed instead.
        const current_player = globalGameData.players.find(p => p.id === socket.id)!;
        if (!PlayerClient.is_dead && current_player.hp <= 0) {
            UI.showDeathScreen();
            setTimeout(() => {
                UI.hideDeathScreen();
            }, 2000);
            PlayerClient.is_dead = true;
        }
    }
});

// This event is triggered when the player
// that has paused the game quit it.
// In that case a new player must get
// the right to decide whether or not to continue it.
socket.on("game_pauser_quit", (game: GameData) => {
    globalGameData = game;
    const manager = globalGameData!.players[0];
    UI.changePauserName(manager.username, manager.id === socket.id);
});

setInterval(() => {
    if (isInGame() && !globalGameData!.paused && !globalGameData!.is_over) {
        const player = globalGameData!.players.find(p => p.id === socket.id)!;
        if (player.hp > 0) {
            const current_pos = PlayerClient.getPosition();
            if (
                current_pos.x > GameClient.limits.maxX ||
                current_pos.x < GameClient.limits.minX ||
                current_pos.y < GameClient.limits.minY ||
                current_pos.y > GameClient.limits.maxY
            ) {
                // Emergency replace if the player resizes its screen
                // and gets out of the screen
                PlayerClient.replace();
            }
            PlayerClient.move();
            socket.emit("player_moved", PlayerClient.getPosition());
        }
    }
}, 1000 / 60);

// The order in which those two
// functions are called do not matter.
preloadAssets();
render();
