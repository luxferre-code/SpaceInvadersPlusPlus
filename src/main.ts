import { preloadSkins } from "./utils/Skins";
import GameSettingsPage from "./ui/GameSettingsPage";
import SettingsDB from "./server/GlobalSettingsDB";
import GameSettings from "./models/GameSettings";
import SettingsPage from "./ui/SettingsPage";
import RankingPage from "./ui/RankingPage";
import RankingDB from "./server/RankingDB";
import Random from "./utils/Random";
import Player from "./Player";
import Enemy from "./Enemy";
import Game from "./Game";
import UI from "./ui/UI";

const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
const game = new Game();

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
        const player = new Player(canvas, GameSettings.playerHp, GameSettings.playerShootDelay, SettingsDB.skin);
        const enemy: Enemy = new Enemy(canvas);
        game.addEntity(player);
        game.addEntity(enemy);
        playing = true;
        UI.hideUI();
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
    }
}, 1000 / 60);

// The order in which those two
// functions are called do not matter.
preloadAssets();
render();
