import Vector2 from "./Vector2";

/**
 * Class representing a player
 */
export default class Player {

    private static maxHP: number = 5;
    private static speedAcceleration: number = 1;
    public static maxSpeed: number = 20;
    private horizontalMovement: boolean = false;
    private verticalMovement: boolean = false;
    private imageLoaded: boolean = false;
    private _name: string;
    private _score: number;
    private _color: string;
    private _hp: number;
    private _position: Vector2;
    private _speed: Vector2;
    private _context: CanvasRenderingContext2D;
    private _skin: HTMLImageElement;

    constructor(name: string, color: string, canvas: HTMLCanvasElement, position: Vector2 = new Vector2(0, 0), disableControls: boolean = false, skin: HTMLImageElement = new Image()) {
        this._name = name;
        this._score = 0;
        this._color = color;
        this._hp = Player.maxHP;
        this._position = position;
        this._speed = new Vector2();
        this._context = canvas.getContext("2d")!;
        if(!disableControls) this.addEventListener(canvas);
        this._skin = skin;
        this._skin.src = "/assets/skins/skin-red.png";
        this._skin.onload = () => this.imageLoaded = true;
    }

    private addEventListener(canvas: HTMLCanvasElement) : void {
        console.log("Adding event listener to the canvas.");
        console.log(canvas);
        window.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "ArrowUp" && -this._speed.y < Player.maxSpeed) {
                this._speed.y -= Player.speedAcceleration;
                this.verticalMovement = true;
            }
            if (event.key === "ArrowDown" && this._speed.y < Player.maxSpeed) {
                this._speed.y += Player.speedAcceleration;
                this.verticalMovement = true;
            }
            if (event.key === "ArrowLeft" && -this._speed.x < Player.maxSpeed) {
                this._speed.x -= Player.speedAcceleration;
                this.horizontalMovement = true;
            }
            if (event.key === "ArrowRight" && this._speed.x < Player.maxSpeed) {
                this._speed.x += Player.speedAcceleration;
                this.horizontalMovement = true;
            }
            
        });
        window.addEventListener("keyup", (event: KeyboardEvent) => {
            if(event.key === "ArrowUp" || event.key === "ArrowDown") this.verticalMovement = false;
            if(event.key === "ArrowLeft" || event.key === "ArrowRight") this.horizontalMovement = false;
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

    /**
     * Method to decrease the player's HP
     * @returns  (boolean) true if the player is alive, false otherwise
     */
    public lostHP() : boolean {
        return --this._hp > 0;
    }

    public forceImageLoaded() : void {
        this.imageLoaded = true;
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
        console.log(this.skin.width);
        console.log(this.skin.height);
        if(this.imageLoaded) {
            if(Math.abs(this.speed.x) > Player.maxSpeed || Math.abs(this.speed.y) > Player.maxSpeed) {
                const clampedSpeedX = Math.max(-Player.maxSpeed, Math.min(Player.maxSpeed, this.speed.x));
                const clampedSpeedY = Math.max(-Player.maxSpeed, Math.min(Player.maxSpeed, this.speed.y));
                this.speed = new Vector2(clampedSpeedX, clampedSpeedY);
            }
            let next = this.position.add(this.speed);
            if(next.x < 0 || next.y < 0) next = new Vector2(Math.max(0, next.x), Math.max(0, next.y));
            const canvasWidth = this._context.canvas.clientWidth;
            const canvasHeight = this._context.canvas.clientHeight;
            const skinWidth = this.skin.width;
            const skinHeight = this.skin.height;
            if(next.x + skinWidth > canvasWidth) {
                const offsetX = next.x + skinWidth - canvasWidth;
                next = next.sub(new Vector2(offsetX, 0));
            }
            if(next.y + skinHeight > canvasHeight) {
                const offsetY = next.y + skinHeight - canvasHeight;
                next = next.sub(new Vector2(0, offsetY));
            }
            this.position = next;
        }
    }

    public render() : void {
        this._context.fillStyle = this._color;
        this._context.beginPath();
        // Draw image if is loaded
        if(this.imageLoaded) this._context.drawImage(this._skin, this._position.x, this._position.y, 50, 50);
        else {
            this._context.arc(this._position.x, this._position.y, 25, 0, 2 * Math.PI);
            this._context.fill();
        }
        this._context.fill();
    }

}