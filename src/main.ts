import Player from "./Player";

console.log("yo");
const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
const player: Player = new Player("Player 1", "red", canvas);

console.log(player.toString());

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    player.render();
    requestAnimationFrame(render);
}

setInterval(() => player.move(), 1000 / 20);

render();
