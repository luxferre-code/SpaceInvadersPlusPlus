import Bullet from "./Bullet";
import { Controls } from "./Controls";
import Game from "./Game";
import IEntity from "./IEntity";
import Sprite2D from "./Sprite2D";
import Vector2 from "./Vector2";

/**
 * Player class  -   This class represents the player entity in the game.
 * 
 * @author Valentin THUILLIER <valentin.thuillier.etu@univ-lille.fr>
 * @extends Sprite2D
 * @implements IEntity
 * @version 1.0.0
 */
export default class Player extends Sprite2D implements IEntity {
    public static readonly maxSpeed: number = 30;

    private static _maxHP: number = 5;
    private static _speedAcceleration: number = 2;
    
    private _horizontalMovement: boolean = false;
    private _verticalMovement: boolean = false;
    private _name: string;
    private _score: number;
    private _color: string;
    private _hp: number;
    private _position: Vector2;
    private _speed: Vector2;
    private _bullets: Bullet[] = [];
    private _canShoot: boolean = true;
    public static readonly TIMEOUT_SHOOT: number = 500;

    constructor(name: string, color: string, canvas: HTMLCanvasElement, position = new Vector2(), disableControls = false, skin = new Image()) {
        super(canvas, skin);
        this._name = name;
        this._score = 0;
        this._color = color;
        this._hp = Player._maxHP;
        this._position = position;
        this._speed = new Vector2();
        if(!disableControls) {
            this.initializeMovementControls();
        }
    }

    private initializeMovementControls() : void {
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === Controls.UP && -this._speed.y < Player.maxSpeed) {
                this._speed.y -= Player._speedAcceleration;
                this._verticalMovement = true;
            }
            if (e.key === Controls.DOWN && this._speed.y < Player.maxSpeed) {
                this._speed.y += Player._speedAcceleration;
                this._verticalMovement = true;
            }
            if (e.key === Controls.LEFT && -this._speed.x < Player.maxSpeed) {
                this._speed.x -= Player._speedAcceleration;
                this._horizontalMovement = true;
            }
            if (e.key === Controls.RIGHT && this._speed.x < Player.maxSpeed) {
                this._speed.x += Player._speedAcceleration;
                this._horizontalMovement = true;
            }
            if(e.code === Controls.SHOOT) {
                console.log("Shoot by " + this.name);
                this.shoot();
            }
        });

        window.addEventListener("keyup", (e: KeyboardEvent) => {
            if(e.key === Controls.UP || e.key === Controls.DOWN) this._verticalMovement = false;
            if(e.key === Controls.LEFT || e.key === Controls.RIGHT) this._horizontalMovement = false;
        });
    }

    public get name() : string { return this._name; }
    public set name(name: string) { this._name = name; }
    public get score() : number { return this._score; }
    public set score(score: number) { this._score = score; }
    public get color() : string { return this._color; }
    public set color(color: string) { this._color = color; }
    public get hp() : number { return this._hp; }
    public set hp(hp: number) { this._hp = hp; }
    public get position() : Vector2 { return this._position; }
    public set position(position: Vector2) { this._position = position; }
    public get speed() : Vector2 { return this._speed; }
    public set speed(speed: Vector2) { this._speed = speed; }
    public get skin() : HTMLImageElement { return this._skin; }
    public set verticalMovement(verticalMovement: boolean) { this._verticalMovement = verticalMovement; }
    public get verticalMovement() : boolean { return this._verticalMovement; }
    public set horizontalMovement(horizontalMovement: boolean) { this._horizontalMovement = horizontalMovement; }
    public get horizontalMovement() : boolean { return this._horizontalMovement; }

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

    /**
     * Method to move the player
     */
    public move() : void {
        if(this.isSkinLoaded()) {
            if(Math.abs(this.speed.x) > Player.maxSpeed || Math.abs(this.speed.y) > Player.maxSpeed) {
                const clampedSpeedX = Math.max(-Player.maxSpeed, Math.min(Player.maxSpeed, this.speed.x));
                const clampedSpeedY = Math.max(-Player.maxSpeed, Math.min(Player.maxSpeed, this.speed.y));
                this.speed = new Vector2(clampedSpeedX, clampedSpeedY);
            }
            let next = this.position.add(this.speed);
            if(next.x < 0 || next.y < 0) {
                next = new Vector2(Math.max(0, next.x), Math.max(0, next.y));
                this.speed = new Vector2(-this.speed.x, -this.speed.y); // Add opposition effect
            }
            const canvasWidth = this._context.canvas.clientWidth;
            const canvasHeight = this._context.canvas.clientHeight;
            const skinWidth = this.skin.width;
            const skinHeight = this.skin.height;
            if(next.x + skinWidth > canvasWidth) {
                const offsetX = next.x + skinWidth - canvasWidth;
                next = next.sub(new Vector2(offsetX, 0));
                this.speed = new Vector2(-this.speed.x, this.speed.y); // Add opposition effect
            }
            if(next.y + skinHeight > canvasHeight) {
                const offsetY = next.y + skinHeight - canvasHeight;
                next = next.sub(new Vector2(0, offsetY));
                this.speed = new Vector2(this.speed.x, -this.speed.y); // Add opposition effect
            }
            this.position = next;
        }
        if(!this.verticalMovement) this.speed = new Vector2(this.speed.x * 0.9, this.speed.y);
        if(!this.horizontalMovement) this.speed = new Vector2(this.speed.x, this.speed.y * 0.9);
    }

    /**
     * Method to render the player
     */
    public render() : void {
        this._context.fillStyle = this._color;
        this._context.beginPath();
        // Draw image if is loaded
        if(this.isSkinLoaded()) this._context.drawImage(this._skin, this._position.x, this._position.y, 50, 50);
        else {
            this._context.arc(this._position.x, this._position.y, 25, 0, 2 * Math.PI);
            this._context.fill();
        }
        this._context.fill();
        this._context.closePath();
        this._bullets.forEach((bullet: Bullet) => {
            bullet.render(this._context);
        });
    }

    /**
     * Method to shoot a bullet
     * @returns     {Bullet}    The bullet shot
     */
    public shoot() : void {
        if(!this._canShoot) return;
        const bullet: Bullet = new Bullet(this.position.add(new Vector2(this._skin.width / 2, 0)));
        bullet.attachTo(this);
        this._canShoot = false;
        setTimeout(() => {
            this._canShoot = true;
        }, Player.TIMEOUT_SHOOT);
        if(Game.this != null) {
            Game.this.addBullet(bullet);
        }
    }

    public isPlayer(): boolean {
        return true;
    }

    public get canvas() : HTMLCanvasElement { return this._context.canvas; }
    public get context() : CanvasRenderingContext2D { return this._context; }
    public get image() : HTMLImageElement { return this._skin; }


}