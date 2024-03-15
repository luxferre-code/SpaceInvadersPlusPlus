import { ACCEPTABLE_CONTROLS, Controls } from "./Controls";
import Bullet from "./Bullet";
import IEntity from "./IEntity";
import Sprite2D from "./Sprite2D";
import Vector2 from "./Vector2";

/**
 * This class represents the player entity in the game.
 */
export default class Player extends Sprite2D implements IEntity {
    public static readonly maxSpeed: number = 30;

    private static _maxHP: number = 5;
    
    private _hp: number;
    private _score: number;
    private _position: Vector2;

    private readonly MOVEMENT_STRENGTH = 0.2;
    private readonly MAX_VELOCITY = 3;

    private mX = 0; // movement on the X-axis
    private mY = 0; // movement on the Y-axis

    /**
     * This will register any key that is being pressed.
     * The key of this map is the name of the key, in lower case.
     */
    private controls: {[key: string]: boolean} = {};

    constructor(canvas: HTMLCanvasElement, position = new Vector2(), skin = new Image()) {
        super(canvas, skin);
        this._score = 0;
        this._hp = Player._maxHP;
        this._position = position;
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
        if (key in this.controls || ACCEPTABLE_CONTROLS.includes(key)) {
            this.controls[key] = value;
        }
    }

    /**
     * Initializes the event listeners for controlling
     * the player's movement with the keyboard.
     */
    private initializeMovementControls() : void {
        window.addEventListener("keydown", e => this.handleKeyPressed(e, true));
        window.addEventListener("keyup", e => this.handleKeyPressed(e, false));
    }

    // public get score() : number { return this._score; }
    // public set score(score: number) { this._score = score; }
    // public get hp() : number { return this._hp; }
    // public set hp(hp: number) { this._hp = hp; }
    // public get skin() : HTMLImageElement { return this._skin; }

    /**
     * Method to decrease the player's HP
     * @returns  (boolean) true if the player is alive, false otherwise
     */
    public hurt() : boolean {
        return --this._hp > 0;
    }

    public forceImageLoaded() : void {
        this._imageLoaded = true;
    }

    /**
     * Method to increase the player's score
     * @param scoreAdded    (number)    The score to add
     */
    public incrementScore(scoreAdded: number) : void {
        this._score += scoreAdded;
    }

    // public move() : void {
        // if(this.isSkinLoaded()) {
        //     if(Math.abs(this.speed.x) > Player.maxSpeed || Math.abs(this.speed.y) > Player.maxSpeed) {
        //         const clampedSpeedX = Math.max(-Player.maxSpeed, Math.min(Player.maxSpeed, this.speed.x));
        //         const clampedSpeedY = Math.max(-Player.maxSpeed, Math.min(Player.maxSpeed, this.speed.y));
        //         this.speed = new Vector2(clampedSpeedX, clampedSpeedY);
        //     }
        //     let next = this.position.add(this.speed);
        //     if(next.x < 0 || next.y < 0) {
        //         next = new Vector2(Math.max(0, next.x), Math.max(0, next.y));
        //         this.speed = new Vector2(-this.speed.x, -this.speed.y); // Add opposition effect
        //     }
        //     const canvasWidth = this._context.canvas.clientWidth;
        //     const canvasHeight = this._context.canvas.clientHeight;
        //     const skinWidth = this.skin.width;
        //     const skinHeight = this.skin.height;
        //     if(next.x + skinWidth > canvasWidth) {
        //         const offsetX = next.x + skinWidth - canvasWidth;
        //         next = next.sub(new Vector2(offsetX, 0));
        //         this.speed = new Vector2(-this.speed.x, this.speed.y); // Add opposition effect
        //     }
        //     if(next.y + skinHeight > canvasHeight) {
        //         const offsetY = next.y + skinHeight - canvasHeight;
        //         next = next.sub(new Vector2(0, offsetY));
        //         this.speed = new Vector2(this.speed.x, -this.speed.y); // Add opposition effect
        //     }
        //     this.position = next;
        // }
        // if(!this.verticalMovement) this.speed = new Vector2(this.speed.x * 0.9, this.speed.y);
        // if(!this.horizontalMovement) this.speed = new Vector2(this.speed.x, this.speed.y * 0.9);
    // }

    public isXOutOfBounds(nextX: number) {
        return nextX <= 0 || nextX + this.image.width >= this.canvas.width;
    }
    
    public isYOutOfBounds(nextY: number) {
        return nextY <= 0 || nextY + this.image.height >= this.canvas.height;
    }

    public handleMovementControls() {
        if (this.controls[Controls.UP])    this.mY -= this.MOVEMENT_STRENGTH;
        if (this.controls[Controls.RIGHT]) this.mX += this.MOVEMENT_STRENGTH;
        if (this.controls[Controls.DOWN])  this.mY += this.MOVEMENT_STRENGTH;
        if (this.controls[Controls.LEFT])  this.mX -= this.MOVEMENT_STRENGTH;
    }

    public movePlayer() {
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
        }
        if (!this.isYOutOfBounds(nextY)) {
            this._position.y += this.mY;
        }
    }

    /**
     * Method to render the player
     */
    public render() : void {
        this._context.beginPath();
        // Draw image if is loaded
        if (this.isSkinLoaded()) {
            this._context.drawImage(this._skin, this._position.x, this._position.y, 50, 50);
            this._context.fill();
        } else {
            this._context.fillStyle = "red";
            this._context.arc(this._position.x, this._position.y, 25, 0, 2 * Math.PI);
            this._context.fill();
        }
        this._context.closePath();
    }

    /**
     * Method to shoot a bullet
     * @returns     {Bullet}    The bullet shot
     */
    public shoot() : Bullet {
        return new Bullet(this._canvas, this._position);
    }

    public isPlayer(): boolean {
        return true;
    }

    public get position() : Vector2 { return this._position; }
    public set position(n: Vector2) { this._position = n; }
    public get canvas() : HTMLCanvasElement { return this._context.canvas; }
    public get context() : CanvasRenderingContext2D { return this._context; }
    public get image() : HTMLImageElement { return this._skin; }
}