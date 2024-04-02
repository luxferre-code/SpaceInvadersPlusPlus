import Bullet from "./Bullet.js";
import Game from "./Game.js";
import HitBox from "./HitBox.js";
import IEntity from "./IEntity.js";
import Vector2 from "./Vector2.js";

/**
 * This class represents the player entity in the game.
 */
export default class PlayerServer implements IEntity {
    private _canShoot: boolean = true;
    private _shootDelay: number = 500;
    private _hp: number = 5;

    /**
     * Whether or not the player is currently immuned to all sort of damage.
     * This is useful when the player got hit, and we don't want it to get
     * hit multiple times in a row (which would happen if two bullets overlapped).
     */
    private _immune: boolean = false;

    /**
     * For how long the player can stay immune to any damage
     * (see {@link _immune}).
     */
    private readonly IMMUNITY_DELAY = 500;

    /**
     * It describes by how many pixels pressing a control key moves the player on each frame.
     * The higher this value, the higher the player's acceleration towards {@link MAX_VELOCITY}.
     */
    private readonly MOVEMENT_STRENGTH = 0.8;

    /**
     * The coefficient that is applied to a movement (either {@link mX} or {@link mY})
     * that is meant to make the player bounce against a wall.
     * 
     * A value too high won't change a thing since the movements are limited to {@link MAX_VELOCITY}.
     * Note that it must be NEGATIVE.
     */
    private readonly REPULSIVE_STRENGTH = -2;

    /**
     * The maximum amount of pixels the player is allowed to move on every frame.
     * This describes the maximum value that the movement variables
     * ({@link mX} and {@link mY}) can reach.
     * 
     * Note that this max velocity isn't necessarily reached.
     * The maximum speed of the player can exceed it by the amount described by {@link MOVEMENT_STRENGTH}.
     */
    private readonly MAX_VELOCITY = 5;

    /**
     * A callback to call when the player gets hit.
     * See {@link hurt}.
     */
    private on_player_hit_callback: null | ((hp: number) => void) = null;

    /**
     * Describes the player's current movement on the X-axis.
     * A value of 0 means the player isn't moving horizontally.
     */
    private mX = 0;

    /**
     * Describes the player's current movement on the Y-axis.
     * A value of 0 means the player isn't moving vertically.
     */
    private mY = 0;

    private _position: Vector2;
    private _imageWidth: number;
    private _imageHeight: number;
    private _socketId: string;

    /**
     * Creates a new player and places it at the center of the screen
     * and a short distance away from the bottom.
     */
    constructor(position: Vector2, imageWidth: number, imageHeight: number, socketId: string) {
        this._position = position;
        this._imageWidth = imageWidth;
        this._imageHeight = imageHeight;
        this._socketId = socketId;
    }
    
    getPosition(): Vector2 {
        throw new Error("Method not implemented.");
    }

    
    public render(): void {
        console.log('Cannot render player on server side!');
    }

    /**
     * Returns `true` if the player is temporarily immuned to all damage.
     */
    public isImmuned() {
        return this._immune;
    }

    /**
     * Method to decrease the player's HP
     * @returns true if the player is alive, false otherwise
     */
    public hurt() : boolean {
        if (!this._immune) {
            this._hp -= 1;
            this._immune = true;
            this.on_player_hit_callback?.(this._hp);
            setTimeout(() => {
                this._immune = false;
            }, this.IMMUNITY_DELAY);
        }
        return this._hp > 0;
    }

    /**
     * Defines a callback when the player gets hit.
     */
    public onPlayerHit(callback: (hp: number) => void) {
        this.on_player_hit_callback = callback;
    }

    /**
     * Gets the player's health points.
     */
    public getHealth(): number {
        return this._hp;
    }

    /**
     * Sets the health points of the player dynamically.
     */
    public setHealth(hp: number) {
        this._hp = hp;
    }

    /**
     * Returns `true` if the player's future horizontal
     * position does not exceed the limits of the screen
     * @param nextX The next value of {@link mX}.
     */
    private isXOutOfBounds(nextX: number) {
        return nextX <= Game.limits.minX || nextX + this._imageWidth >= Game.limits.maxX;
    }
    
    /**
     * Returns `true` if the player's future vertical
     * position does not exceed the limits of the screen
     * @param nextY The next value of {@link mY}.
     */
    private isYOutOfBounds(nextY: number) {
        return nextY <= Game.limits.minY || nextY + this._imageHeight >= Game.limits.maxY;
    }

    /**
     * Moves the player.
     * Call this method on every frame.
     */
    public move() {
        this.mX *= 0.95; // the movement on the X-axis get reduced by 5% on every frame
        this.mY *= 0.95; // the movement on the y-axis get reduced by 5% on every frame

        // By default, if we keep reducing by 5%
        // then the movements will never reach 0.
        // That's annoying because we get very quickly to
        // numbers such as 5e-20 (which are irrelevant movements).
        // To avoid this, if the distance to 0 is below a threshold,
        // then it gets set to 0 manually.
        // It's not a problem when starting the movement,
        // as long as the threshold is less than `this.MOVEMENT_STRENGTH`.
        if (Math.abs(this.mX) < 0.005) this.mX = 0;
        if (Math.abs(this.mY) < 0.005) this.mY = 0;

        // Here, we make sure that the velocity doesn't exceed `this.MAX_VELOCITY`.
        // This check works for both negative and positive numbers.
        // Note that "Math.sign" returns -1 for a negative number, or 1 for positive.
        if (Math.abs(this.mX) > this.MAX_VELOCITY) this.mX = Math.sign(this.mX) * this.MAX_VELOCITY;
        if (Math.abs(this.mY) > this.MAX_VELOCITY) this.mY = Math.sign(this.mY) * this.MAX_VELOCITY;

        // This makes sure that the player doesn't get out of the canvas.
        const nextX = this._position.x + this.mX;
        const nextY = this._position.y + this.mY;

        if (!this.isXOutOfBounds(nextX)) {
            this._position.x += this.mX;
        } else {
            // The player reached an horizontal border of the screen.
            // Apply a repulsive force to keep it away.
            this.mX *= this.REPULSIVE_STRENGTH;
        }

        if (!this.isYOutOfBounds(nextY)) {
            this._position.y += this.mY;
        } else {
            // The player reached a vertical border of the screen.
            // Apply a repulsive force to keep it away.
            this.mY *= this.REPULSIVE_STRENGTH;
        }
    }

    /**
     * Shoots a bullet.
     * @returs The bullet that was created.
     */
    public shoot() : void {
        if(!this._canShoot) return;
        const bullet: Bullet = new Bullet(this._position.add(new Vector2(this._imageWidth / 2, 0)));
        bullet.attachTo(this);
        this._canShoot = false;
        setTimeout(() => {
            this._canShoot = true;
        }, this._shootDelay);
        Game.getInstance(this._socketId).addBullet(bullet);
    }

    public generateHitBox(): HitBox {
        return new HitBox(this._position, this._imageWidth, this._imageHeight);
    }

    public isColliding(enemy: IEntity): boolean {
        // This code check if the enemy is colliding with another entity
        const hitBox: HitBox = this.generateHitBox();
        const otherHitBox: HitBox = enemy.generateHitBox();
        return hitBox.isColliding(otherHitBox);
    }

    /**
     * Is this entity a player?
     */
    public isPlayer(): this is PlayerServer {
        return true;
    }
}
