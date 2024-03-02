import Vector2 from "./Vector2";

export default class Enemy {

    private position: Vector2;
    private speed: Vector2;
    private context: CanvasRenderingContext2D;
    private skin: HTMLImageElement;
    private imageLoaded: boolean = false;

    constructor(canvas: HTMLCanvasElement, position: Vector2 = Enemy.generateRandomPosition(canvas), speed: Vector2 = new Vector2(-1, 0), skin: HTMLImageElement = new Image()) {
        this.position = position;
        this.speed = speed;
        this.context = canvas.getContext("2d")!;
        this.skin = skin;
        this.skin.src = "/assets/skins/skin-red.png";
        this.skin.onload = () => this.imageLoaded = true;
    }

    public static generateRandomPosition(canvas: HTMLCanvasElement) : Vector2 {
        return new Vector2(-1, -1);
    }


} 