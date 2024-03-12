import Bullet from "./Bullet";
import Game from "./Game";
import IEntity from "./IEntity";
import Player from "./Player";
import Sprite2D from "./Sprite2D";
import Vector2 from "./Vector2";

/**
 * Enemy class  -   This class represents the enemy entity in the game.
 * 
 * @author Valentin THUILLIER <valentin.thuillier.etu@univ-lille.fr>
 * @extends Sprite2D
 * @implements IEntity
 * @version 1.0.0
 */
export default class Enemy extends Sprite2D implements IEntity {
    private static _horizontally: boolean = true;

    private _position: Vector2;
    private _speed: Vector2;
    private _dead: boolean = false;
    private _hp: number = 1;
    private _scoreToGive: number = 10;
    private static _shootProbability: number = 0.05;
    private _canShoot: boolean = true;
    public static readonly TIMEOUT_SHOOT: number = 500;

    constructor(canvas: HTMLCanvasElement, position: Vector2 = Enemy.generateRandomXPosition(canvas), speed: Vector2 = new Vector2(Enemy._horizontally ? 0 : 10, Enemy._horizontally ? 10 : 0), skin: HTMLImageElement = new Image()) {
        super(canvas, skin);
        this._position = position;
        this._speed = speed;
    }

    /**
     * This method checks if the entity is a player.
     * @returns     {boolean}   -   True if the entity is a player, false otherwise.
     */
    public isPlayer(): boolean {
        return false;
    }

    /**
     * This method generates a random position on the x-axis of the canvas.
     * @param canvas    {HTMLCanvasElement}    -   The canvas where the game is rendered.
     * @returns     {Vector2}               -   The random position.
     */
    public static generateRandomXPosition(canvas: HTMLCanvasElement) : Vector2 {
        return new Vector2(Math.random() * canvas.width, 0);
    }

    /**
     * This method kill the enemy and give the score to the player who killed it.
     * @param player    {Player}    -   The player who killed the enemy.
     * @returns     {boolean}   -   True if the enemy is dead, false otherwise.
     */
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

    /**
     * This method moves the enemy to the next position.
     */
    public next() : void {
        if(Enemy.horizontally) {
            console.log("Moving horizontally");
            this._position.y += this._speed.y;
        } else {
            console.log("Moving vertically");
            this._position.x += this._speed.x;
        }
        if(Enemy._shootProbability > Math.random()) {
            console.log("Shooting");
            this.shoot();
        }
    }

    public shoot() : void {
        if(!this._canShoot) return;
        const bullet: Bullet = new Bullet(this._position);
        bullet.attachTo(this);
        this._canShoot = false;
        setTimeout(() => {
            this._canShoot = true;
        }, Enemy.TIMEOUT_SHOOT);
        Game.this.addBullet(bullet);
    }

    public move() : void {
        this.next();
    }

    /**
     * This method renders the enemy on the canvas.
     */
    public render() : void {
        if(this._dead) return;
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