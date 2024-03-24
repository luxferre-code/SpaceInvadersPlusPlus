import { Skin } from "./utils/Skins";
import Bullet from "./Bullet";
import Game from "./Game";
import Player from "./Player";
import Sprite2D from "./Sprite2D";
import Vector2 from "./Vector2";

/**
 *  This class represents the enemy entity in the game.
 */
export default class Enemy extends Sprite2D implements IEntity {
    public static readonly TIMEOUT_SHOOT: number = 500;
    private static _shootProbability: number = 0.05;

    private _speed: Vector2;
    private _dead: boolean = false;
    private _hp: number = 1;
    private _scoreToGive: number = 10;
    private _canShoot: boolean = true;

    constructor(canvas: HTMLCanvasElement, position?: Vector2, speed = new Vector2(10, 0)) {
        super(canvas, Skin.GREEN);
        this._position = position ?? Enemy.generateRandomXPosition(this._skinImg.width);
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
     * The X coordinate won't be equal to the border's X limits,
     * indeed it will be strictly greater than the lower
     * limit and strictly less than the upper limit.
     * @param canvas The canvas where the game is rendered.
     * @returns The random position.
     */
    public static generateRandomXPosition(width: number): Vector2 {
        return new Vector2(Game.random.nextInt(
            Game.limits.minX + 1,
            Game.limits.maxX - width
        ), 30);
    }

    /**
     * This method kills the enemy and increments the general score of the game.
     * @returns True if the enemy is dead, false otherwise.
     */
    public die(): boolean {
        this._hp--;
        if (this._hp > 0) {
            return false;
        } else {
            this._dead = true;
            Game.getInstance()?.incrementScore(this._scoreToGive);
            return true;
        }
    }

    public shoot(): void {
        if (!this._canShoot) return;
        const bullet: Bullet = new Bullet(this._canvas, this._position);
        bullet.attachTo(this);
        this._canShoot = false;
        setTimeout(() => {
            this._canShoot = true;
        }, Enemy.TIMEOUT_SHOOT);
        Game.getInstance().addBullet(bullet);
    }

    public move(): void {
        this._position.y += this._speed.y;
        if (Enemy._shootProbability > Game.random.next()) {
            console.log("Shooting");
            this.shoot();
        }
    }

    /**
     * This method renders the enemy on the canvas.
     */
    public render(): void {
        if (this._dead) return;
        super.render();
    }

    public setSpeed(speed: Vector2) { this._speed = speed; }
    public isDead(): boolean { return this._dead; }
} 
