import Vector2 from "./Vector2";

/**
 * Class representing a player
 */
export default class Player {

    private static maxHP: number = 5;
    private static speedAcceleration: number = 1;
    private static maxSpeed: number = 20;
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

    private addEventListener(canvas: HTMLCanvasElement) : void {}

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

    /**
     * Method to decrease the player's HP
     * @returns  (boolean) true if the player is alive, false otherwise
     */
    public lostHP() : boolean {
        return --this._hp > 0;
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
    public move() : void {}

}