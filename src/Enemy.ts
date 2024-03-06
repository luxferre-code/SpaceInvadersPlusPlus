import IEntity from "./IEntity";
import Player from "./Player";
import Sprite2D from "./Sprite2D";
import Vector2 from "./Vector2";

export default class Enemy extends Sprite2D implements IEntity {
    private static _horizontally: boolean = true;

    private _position: Vector2;
    private _speed: Vector2;
    private _dead: boolean = false;
    private _hp: number = 1;
    private _scoreToGive: number = 10;

    constructor(canvas: HTMLCanvasElement, position: Vector2 = Enemy.generateRandomXPosition(canvas), speed: Vector2 = new Vector2(Enemy._horizontally ? 0 : 10, Enemy._horizontally ? 10 : 0), skin: HTMLImageElement = new Image()) {
        super(canvas, skin);
        this._position = position;
        this._speed = speed;
    }

    public isPlayer(): boolean {
        return false;
    }

    public static generateRandomXPosition(canvas: HTMLCanvasElement) : Vector2 {
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
    public static get horizontally() { return Enemy._horizontally; }
    public static set horizontally(value: boolean) { Enemy._horizontally = value; }
    public get position() : Vector2 { return this._position; }
    public set speed(speed: Vector2) { this._speed = speed; }

    public next() : void {
        if(Enemy.horizontally) {
            console.log("Moving horizontally");
            this._position.y += this._speed.y;
        } else {
            //TODO
        }
    }

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