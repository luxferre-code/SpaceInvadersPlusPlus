import Player from "./Player";

console.log("yo");
const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;

// Add event listener, if window is move, resize canva heigt et width

function resize() : void {
    console.log("Resizing canvas.");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

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
