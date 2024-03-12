import Enemy from "./Enemy";
import Game from "./Game";
import Player from "./Player";
import Vector2 from "./Vector2";

const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;

// Add event listener, if window is move, resize canva heigt et width

window.addEventListener("resize", () => {
    console.log("Resizing canvas.");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.addEventListener("load", () => {
    console.log("Initializing canvas size.");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.position = new Vector2(canvas.width / 2 - 25, canvas.height - canvas.height / 4);
});

const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
const player: Player = new Player("Player 1", "red", canvas);
const enemy : Enemy = new Enemy(canvas);

const game : Game = new Game(canvas);
game.addEntity(player);
game.addEntity(enemy);

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    game.updateRender();
    requestAnimationFrame(render);
}

setInterval(() => {
    game.updateMove();
}, 1000 / 20);

render();
