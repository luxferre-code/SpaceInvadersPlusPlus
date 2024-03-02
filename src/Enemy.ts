import Player from "./Player";
import Vector2 from "./Vector2";

export default class Enemy {

    private _position: Vector2;
    private _speed: Vector2;
    private _context: CanvasRenderingContext2D;
    private _skin: HTMLImageElement;
    private _imageLoaded: boolean = false;
    private _dead: boolean = false;
    private _hp: number = 1;
    private _scoreToGive: number = 10;

    constructor(canvas: HTMLCanvasElement, position: Vector2 = Enemy.generateRandomPosition(canvas), speed: Vector2 = new Vector2(-1, 0), skin: HTMLImageElement = new Image()) {
        this._position = position;
        this._speed = speed;
        this._context = canvas.getContext("2d")!;
        this._skin = skin;
        this._skin.src = "/assets/skins/skin-red.png";
        this._skin.onload = () => this._imageLoaded = true;
    }

    public static generateRandomPosition(canvas: HTMLCanvasElement) : Vector2 {
        return new Vector2(Math.random() * canvas.width, 0);
    }

    public killedBy(player: Player) : boolean {
        this._hp--;
        if(this._hp > 0) return false;
        this._dead = true;
        player.score += this._scoreToGive;
        return true;
    }

    public get isDead() : boolean { return this._dead; }

    public render() : void {
        this._context.beginPath();
        // Draw image if is loaded
        if(this._imageLoaded) this._context.drawImage(this._skin, this._position.x, this._position.y, 50, 50);
        else {
            this._context.arc(this._position.x, this._position.y, 25, 0, 2 * Math.PI);
            this._context.fill();
        }
        this._context.fill();
    }

} 