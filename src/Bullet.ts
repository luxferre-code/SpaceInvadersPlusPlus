import Player from "./Player";
import Vector2 from "./Vector2";

export default class Bullet {

    private _position: Vector2;
    private _velocity: Vector2;
    private _owner : any;
    public static _isVertical: boolean = true;
    public static _bulletSpeed: number = 10;

    constructor(position: Vector2) {
        this._position = position;
        this._velocity = new Vector2(0, 0);
    }

    public get position() : Vector2 { return this._position; }
    public get velocity() : Vector2 { return this._velocity; }
    public get owner() : any { return this._owner; }

    public attachTo(player: Player) : void {
        this._owner = player;
        this._position = player.position;
        this._velocity = new Vector2(!Bullet._isVertical ? Bullet._bulletSpeed : 0, Bullet._isVertical ? -Bullet._bulletSpeed : 0);
    }

}