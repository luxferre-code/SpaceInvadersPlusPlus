import Vector2 from "./Vector2";

export default class Bullet {

    private _position: Vector2;
    private _velocity: Vector2;
    private static _isVertical: boolean = true;

    constructor(position: Vector2) {
        this._position = new Vector2(-1, -1);
        this._velocity = new Vector2(0, 0);
    }

    public get position() : Vector2 { return this._position; }
    public get velocity() : Vector2 { return this._velocity; }

}