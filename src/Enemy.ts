import Player from "./Player";
import Vector2 from "./Vector2";

export default class Enemy {

    private position: Vector2;
    private speed: Vector2;
    private context: CanvasRenderingContext2D;
    private skin: HTMLImageElement;
    private imageLoaded: boolean = false;
    private dead: boolean = false;
    private hp: number = 1;
    private scoreToGive: number = 10;

    constructor(canvas: HTMLCanvasElement, position: Vector2 = Enemy.generateRandomPosition(canvas), speed: Vector2 = new Vector2(-1, 0), skin: HTMLImageElement = new Image()) {
        this.position = position;
        this.speed = speed;
        this.context = canvas.getContext("2d")!;
        this.skin = skin;
        this.skin.src = "/assets/skins/skin-red.png";
        this.skin.onload = () => this.imageLoaded = true;
    }

    public static generateRandomPosition(canvas: HTMLCanvasElement) : Vector2 {
        return new Vector2(Math.random() * canvas.width, 0);
    }

    public killedBy(player: Player) : boolean {
        this.hp--;
        if(this.hp > 0) return false;
        this.dead = true;
        player.score += this.scoreToGive;
        return true;
    }

    public get isDead() : boolean { return this.dead; }

} 