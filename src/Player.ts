import { MOVEMENT_CONTROLS, Controls } from "./Controls";
import { Skin } from "./Skins";
import Bullet from "./Bullet";
import Game from "./Game";
import IEntity from "./IEntity";
import Sprite2D from "./Sprite2D";
import Vector2 from "./Vector2";

/**
 * This class represents the player entity in the game.
 */
export default class Player extends Sprite2D implements IEntity {
    private _canShoot: boolean = true;
    private shootDelay: number;
    private _hp: number;

    /**
     * It describes by how many pixels pressing a control key moves the player on each frame.
     * The higher this value, the higher the player's acceleration towards {@link MAX_VELOCITY}.
     */
    private readonly MOVEMENT_STRENGTH = 0.2;

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
    private readonly MAX_VELOCITY = 3;

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

    /**
     * This will register any key that is being pressed.
     * The key of this map is the name of the key, in lower case.
     */
    private controls: {[key: string]: boolean} = {};

    /**
     * Creates a new player and places it at the center of the screen
     * and a short distance away from the bottom.
     */
    constructor(canvas: HTMLCanvasElement, based_health: number, shoot_delay: number, skin = Skin.RED) {
        super(canvas, skin);
        this._hp = based_health;
        this.shootDelay = shoot_delay;
        if (this._skinImg) {
            this._position = new Vector2(canvas.width / 2 - this._skinImg?.width, canvas.height - this._skinImg?.height * 2);
        } else {
            this._position = new Vector2();
        }
        this.initializeMovementControls();
    }

    /**
     * Handles a key that is being pressed.
     * It checks if it's a control key (a key in the {@link Controls} enum).
     * If it is, it assigns the given `value` in {@link controls}.
     * @param e The keyboard event.
     * @param value The value to assign to {@link this.controls} if the key is a valid key.
     */
    private handleKeyPressed(e: KeyboardEvent, value: boolean) {
        const key = e.key.toLocaleLowerCase();
        if (key in this.controls || MOVEMENT_CONTROLS.includes(key)) {
            this.controls[key] = value;
        }
    }

    /**
     * Initializes the event listeners for controlling
     * the player's movement with the keyboard.
     */
    private initializeMovementControls() : void {
        window.addEventListener("keydown", e => {
            if (e.code === "Space") {
                this.shoot();
            } else {
                this.handleKeyPressed(e, true);
            }
        });

        window.addEventListener("keyup", e => this.handleKeyPressed(e, false));
    }

    /**
     * Method to decrease the player's HP
     * @returns true if the player is alive, false otherwise
     */
    public hurt() : boolean {
        return --this._hp > 0;
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
        return nextX <= 0 || nextX + this.getSkin().width >= this._canvas.width;
    }
    
    /**
     * Returns `true` if the player's future vertical
     * position does not exceed the limits of the screen
     * @param nextY The next value of {@link mY}.
     */
    private isYOutOfBounds(nextY: number) {
        return nextY <= 0 || nextY + this.getSkin().height >= this._canvas.height;
    }

    /**
     * Depending on what keys are currently being pressed,
     * this function will increment or decrement the movement
     * variables accordingly (see {@link mX} and {@link mY}).
     */
    private handleMovementControls() {
        if (this.controls[Controls.UP])    this.mY -= this.MOVEMENT_STRENGTH;
        if (this.controls[Controls.RIGHT]) this.mX += this.MOVEMENT_STRENGTH;
        if (this.controls[Controls.DOWN])  this.mY += this.MOVEMENT_STRENGTH;
        if (this.controls[Controls.LEFT])  this.mX -= this.MOVEMENT_STRENGTH;
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

        // This will check on every frame if keys are pressed,
        // and increment the speed accordingly by a constant amount.
        this.handleMovementControls();

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

    public fallbackRender(): void {
        this._context.beginPath();
        this._context.fillStyle = "red";
        this._context.arc(this._position.x, this._position.y, 25, 0, 2 * Math.PI);
        this._context.fill();
        this._context.closePath();
    }

    /**
     * Shoots a bullet.
     * @returs The bullet that was created.
     */
    public shoot() : void {
        if(!this._canShoot) return;
        const bullet: Bullet = new Bullet(this._canvas, this._position.add(new Vector2(this._skinImg.width / 2, 0)));
        bullet.attachTo(this);
        this._canShoot = false;
        setTimeout(() => {
            this._canShoot = true;
        }, this.shootDelay);
        Game.getInstance().addBullet(bullet);
    }

    /**
     * Is this entity a player?
     */
    public isPlayer(): this is Player {
        return true;
    }
}