import Game from "./Game";
import GameSettingsPage from "./ui/GameSettingsPage";
import SettingsDB from "./server/GlobalSettingsDB";
import SettingsPage from "./ui/SettingsPage";
import RankingPage from "./ui/RankingPage";
import RankingDB from "./server/RankingDB";
import Player from "./Player";
import Vector2 from "./Vector2";
import Enemy from "./Enemy";
import UI from "./ui/UI";

const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
const game = new Game(canvas);

let playing = false;

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
    const player = new Player(canvas, new Vector2(50, 50), SettingsDB.skin);
    const enemy: Enemy = new Enemy(canvas);
    game.addEntity(player);
    game.addEntity(enemy);
    playing = true;
    UI.hideUI();
});

function fillScreen() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Add event listener, if window is being moved, resize canva height et width
window.addEventListener("resize", () => fillScreen());
window.addEventListener("load", () => fillScreen());

function render() {
    if (playing) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        game.updateRender();
        UI.setScore(game.getScore());
    }
    requestAnimationFrame(render);
}

setInterval(() => {
    if (playing) {
        game.updateMove();
    }
}, 1000 / 60);

render();