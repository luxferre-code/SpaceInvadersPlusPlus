import { Controls, MOVEMENT_CONTROLS } from './utils/Controls';
import { io } from 'socket.io-client';
import { preloadSkins } from "./utils/Skins";
import GameSettingsPage from "./ui/GameSettingsPage";
import SettingsDB from "./server/GlobalSettingsDB";
import SettingsPage from "./ui/SettingsPage";
import RankingPage from "./ui/RankingPage";
import RankingDB from "./server/RankingDB";
import LobbyPage from "./ui/LobbyPage";
import GameClient from './GameClient';
import UI from "./ui/UI";

const socket = io(`${window.location.hostname}:3000`);

socket.on('connect', () => {
    console.log('Connected to server as', socket.id);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

// Send to the server the username of the current user
socket.emit("username_changed", SettingsDB.name);

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
// const context = canvas.getContext("2d")!;
GameClient.initWith(canvas);

// This callback gets called every single that
// that the player loses a health point.
// There is a parameter that can be used to
// customise the game's behaviour when the player
// dies.
// player.onPlayerHit((hp: number) => {
//     UI.removeHeart();
//     if (hp == 0) {
//         UI.showDeathScreen();
//         setTimeout(() => {
//             UI.hideDeathScreen();
//             UI.showUI();
//         }, 2000);
//     }
// });

let loadingAssets = true;
let globalGameData: GameData | undefined = undefined;

LobbyPage.bindEvents(socket);
LobbyPage.setOnGameStarted((gameData: GameData) => {
    globalGameData = gameData;
    player_position = gameData.players.find(p => p.id === socket.id)!.position;
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
        // Game.random = new Random(GameSettings.seed === -1 ? new Date().getTime() : GameSettings.seed);
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
        // Initializes the player with its skin.
        // It's important to do it here because as of now
        // the player doesn't have a loaded skin.
        // player.setSkin(SettingsDB.skin);
    } catch (e) {
        console.error(e);
        alert("Quelques skins n'ont pas pu être chargés correctement.");
    }
    loadingAssets = false;
}

// function initializeHealthPoints(hp: number) {
//     for (let i = 0; i < hp; i++) {
//         UI.createHeart();
//     }
// }

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
}

// Add event listener, if window is being moved, resize canva height et width
window.addEventListener("resize", () => fillScreen());
window.addEventListener("load", () => fillScreen());

const controls: { [key: string]: boolean } = {};
let can_shoot = true;
let player_position = { x: 0, y: 0 };
let mX = 0;
let mY = 0;

const MOVEMENT_STRENGTH = 0.8;
const REPULSIVE_STRENGTH = -2;
const MAX_VELOCITY = 5;

function handleKeyPressed(e: KeyboardEvent, value: boolean) {
    const key = e.key.toLocaleLowerCase();
    if (e.code.toLowerCase() === Controls.SHOOT) {
        controls[Controls.SHOOT] = value;
    } else if (MOVEMENT_CONTROLS.includes(key)) {
        controls[key] = value;
    }
}

window.addEventListener("keydown", e => handleKeyPressed(e, true));
window.addEventListener("keyup", e => handleKeyPressed(e, false));

function handleMovementControls() {
    if (controls[Controls.UP]) mY -= MOVEMENT_STRENGTH;
    if (controls[Controls.RIGHT]) mX += MOVEMENT_STRENGTH;
    if (controls[Controls.DOWN]) mY += MOVEMENT_STRENGTH;
    if (controls[Controls.LEFT]) mX -= MOVEMENT_STRENGTH;
    if (controls[Controls.SHOOT]) shoot();
}

function shoot() {
    if (can_shoot) {
        socket.emit("game_player_shooting");
        can_shoot = false;
        setTimeout(() => {
            can_shoot = true;
        }, 500);
    }
}

function isXOutOfBounds(nextX: number) {
    return nextX <= GameClient.limits.minX || nextX + 50 >= GameClient.limits.maxX;
}

/**
 * Returns `true` if the player's future vertical
 * position does not exceed the limits of the screen
 * @param nextY The next value of {@link mY}.
 */
function isYOutOfBounds(nextY: number) {
    return nextY <= GameClient.limits.minY || nextY + 50 >= GameClient.limits.maxY;
}

function move() {
    mX *= 0.95; // the movement on the X-axis get reduced by 5% on every frame
    mY *= 0.95; // the movement on the y-axis get reduced by 5% on every frame

    // By default, if we keep reducing by 5%
    // then the movements will never reach 0.
    // That's annoying because we get very quickly to
    // numbers such as 5e-20 (which are irrelevant movements).
    // To avoid this, if the distance to 0 is below a threshold,
    // then it gets set to 0 manually.
    // It's not a problem when starting the movement,
    // as long as the threshold is less than `MOVEMENT_STRENGTH`.
    if (Math.abs(mX) < 0.005) mX = 0;
    if (Math.abs(mY) < 0.005) mY = 0;

    // Here, we make sure that the velocity doesn't exceed `MAX_VELOCITY`.
    // This check works for both negative and positive numbers.
    // Note that "Math.sign" returns -1 for a negative number, or 1 for positive.
    if (Math.abs(mX) > MAX_VELOCITY) mX = Math.sign(mX) * MAX_VELOCITY;
    if (Math.abs(mY) > MAX_VELOCITY) mY = Math.sign(mY) * MAX_VELOCITY;

    // This will check on every frame if keys are pressed,
    // and increment the speed accordingly by a constant amount.
    handleMovementControls();

    // This makes sure that the player doesn't get out of the canvas.
    const nextX = player_position.x + mX;
    const nextY = player_position.y + mY;

    if (!isXOutOfBounds(nextX)) {
        player_position.x += mX;
    } else {
        // The player reached an horizontal border of the screen.
        // Apply a repulsive force to keep it away.
        mX *= REPULSIVE_STRENGTH;
    }

    if (!isYOutOfBounds(nextY)) {
        player_position.y += mY;
    } else {
        // The player reached a vertical border of the screen.
        // Apply a repulsive force to keep it away.
        mY *= REPULSIVE_STRENGTH;
    }
}

function render() {
    if (globalGameData) {
        GameClient.getContext().clearRect(0, 0, canvas.width, canvas.height);
        for (const player of globalGameData.players) {
            GameClient.renderPlayer(player.position.x, player.position.y, player.skin);
        }
        for (const bullet of globalGameData.bullets) {
            GameClient.renderBullet(bullet.x, bullet.y);
        }
    }
    requestAnimationFrame(render);
}

socket.on("game_update", (game: GameData) => {
    globalGameData = game;
});

setInterval(() => {
    // if (playing) {
    // game.updateMove();
    // game.updateMonsterSpawn();
    // if (game.gameOver()) {
    //     playing = false;
    //     game.reset();
    // }
    // }

    move();
    socket.emit("player_moved", player_position);

}, 1000 / 60);

// The order in which those two
// functions are called do not matter.
preloadAssets();
render();
