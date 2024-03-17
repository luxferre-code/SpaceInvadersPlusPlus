import { Skin } from "./Skins";
import Bullet from "./Bullet";
import Game from "./Game";
import IEntity from "./IEntity";
import Player from "./Player";
import Sprite2D from "./Sprite2D";
import Vector2 from "./Vector2";

/**
 *  This class represents the enemy entity in the game.
 */
export default class Enemy extends Sprite2D implements IEntity {
    public static readonly TIMEOUT_SHOOT: number = 500;
    private static _shootProbability: number = 0.05;
    private static _horizontally: boolean = true;

    private _speed: Vector2;
    private _dead: boolean = false;
    private _hp: number = 1;
    private _scoreToGive: number = 10;
    private _canShoot: boolean = true;

    constructor(canvas: HTMLCanvasElement, position = Enemy.generateRandomXPosition(), speed = new Vector2(Enemy._horizontally ? 0 : 10, Enemy._horizontally ? 10 : 0)) {
        super(canvas, Skin.GREEN);
        this._position = position;
        this._speed = speed;
    }

    /**
     * This method checks if the entity is a player.
     * @returns True if the entity is a player, false otherwise.
     */
    public isPlayer(): this is Player {
        return false;
    }

    /**
     * This method generates a random position on the x-axis of the canvas.
     * @param canvas The canvas where the game is rendered.
     * @returns The random position.
     */
    public static generateRandomXPosition() : Vector2 {
        return new Vector2(Math.random() * Game.limits.maxX, 0);
    }

    /**
     * This method kills the enemy and increments the general score of the game.
     * @returns True if the enemy is dead, false otherwise.
     */
    public die() : boolean {
        this._hp--;
        if (this._hp > 0) {
            return false;
        } else {
            this._dead = true;
            Game.getInstance()?.incrementScore(this._scoreToGive);
            return true;
        }
    }

    public shoot() : void {
        if(!this._canShoot) return;
        const bullet: Bullet = new Bullet(this._canvas, this._position);
        bullet.attachTo(this);
        this._canShoot = false;
        setTimeout(() => {
            this._canShoot = true;
        }, Enemy.TIMEOUT_SHOOT);
        Game.getInstance().addBullet(bullet);
    }

    public move() : void {
        if(Enemy.horizontally) {
            // console.log("Moving enemy horizontally");
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

    public fallbackRender(): void {
        this._context.beginPath();
        this._context.arc(this._position.x, this._position.y, 25, 0, 2 * Math.PI);
        this._context.fill();
        this._context.closePath();
    }

    /**
     * This method renders the enemy on the canvas.
     */
    public render() : void {
        if(this._dead) return;
        super.render();
    }

    public static get horizontally() { return Enemy._horizontally; }
    public static set horizontally(value: boolean) { Enemy._horizontally = value; }

    public setSpeed(speed: Vector2) { this._speed = speed; }
    public isDead(): boolean { return this._dead; }
} 