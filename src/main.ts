import Enemy from "./Enemy";
import Player from "./Player";
import UI from "./UI";

UI.bindEvents();

const dummyScores: Score[] = [
    { score: 1000, date: new Date() },
    { score: 2000, date: new Date() },
    { score: 3000, date: new Date() },
    { score: 4000, date: new Date() },
    { score: 5000, date: new Date() },
    { score: 6000, date: new Date() },
    { score: 7000, date: new Date() },
    { score: 8000, date: new Date() },
];

UI.rankingTable.build10LastScores(dummyScores);

const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;

// Set this varialbe to `false` to allow the UI to appear.
// This variable should not get modified, as it is just for debugging purposes.
// Manually set it `false` if the UI is needed.
// This variable will have to be removed entirely later on.
const playing = false;

// Add event listener, if window is move, resize canva height et width

function resize() : void {
    console.log("Resizing canvas.");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
const player: Player = new Player("Player 1", "red", canvas);
const enemy : Enemy = new Enemy(canvas);

console.log(player.toString());

function render() {
    if (playing) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        player.render();
        enemy.render();
        requestAnimationFrame(render);
    }
}

setInterval(() => {
    if (playing) {
        player.move()
        enemy.next();
    }
}, 1000 / 20);

render();

// This is temporary.
// The goal here is to be able to debug easily
// without having to deal with the UI.
if (playing) {
    UI.hideUI();
}