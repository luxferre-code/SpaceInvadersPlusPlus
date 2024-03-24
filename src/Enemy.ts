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
    private static _shootProbability: number = 0.02;

    private _gravity: number;
    private _dead: boolean = false;
    private _hp: number = 1;
    private _scoreToGive: number = 10;
    private _canShoot: boolean = true;

    constructor(canvas: HTMLCanvasElement, position?: Vector2, gravity = 2) {
        super(canvas, Skin.GREEN);
        this._position = position ?? Enemy.generateRandomSpawnPosition(this._skinImg.width, this._skinImg.height);
        this._gravity = gravity;
    }

    /**
     * This method checks if the entity is a player.
     * @returns True if the entity is a player, false otherwise.
     */
    public isPlayer(): this is Player {
        return false;
    }

    /**
     * This method generates a random spawn position outside of the screen.
     * The enemy spawns above the screen and progressively goes down.
     * The width and height are necessary to make sure the player
     * never sees the enemy spawn suddenly or behind a border.
     * @param width The width of the enemy.
     * @param height The height of the enemy.
     * @returns The random position.
     */
    public static generateRandomSpawnPosition(width: number, height: number): Vector2 {
        return new Vector2(Game.random.nextInt(
            Game.limits.minX + 1,
            Game.limits.maxX - width
        ), -height - 10);
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
        const bullet = new Bullet(this._canvas, this._position);
        bullet.attachTo(this);
        this._canShoot = false;
        setTimeout(() => {
            this._canShoot = true;
        }, Enemy.TIMEOUT_SHOOT);
        Game.getInstance().addBullet(bullet);
    }

    
    /**
     * Moves the enemy down at every frame
     * by a fixed amount of pixels (see {@link _gravity}).
     * The enemy also has a small chance of shooting. 
     */
    public move(): void {
        this._position.y += this._gravity;
        if (this._canShoot && Enemy._shootProbability > Game.random.next()) {
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

    public setGravity(gravity: number) { this._gravity = gravity; }
    public isDead(): boolean { return this._dead; }
} 
