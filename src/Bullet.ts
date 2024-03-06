import Enemy from "./Enemy";
import IEntity from "./IEntity";
import Player from "./Player";
import Vector2 from "./Vector2";

export default class Bullet {

    private _position: Vector2;
    private _velocity: Vector2;
    private _owner : any;
    public static _isVertical: boolean = true;
    public static _bulletSpeed: number = 10;

    constructor(position: Vector2 = new Vector2(0, 0), velocity: Vector2 = new Vector2(!Bullet._isVertical ? Bullet._bulletSpeed : 0, Bullet._isVertical ? -Bullet._bulletSpeed : 0)) {
        this._position = position;
        this._velocity = velocity;
    }

    public get position() : Vector2 { return this._position; }
    public get velocity() : Vector2 { return this._velocity; }
    public get owner() : any { return this._owner; }

    public attachTo(entity: IEntity) : void {
        this._owner = entity;
        this._position = entity.position;
        const velocity: Vector2 = new Vector2(0, 0);
        let xVelocity = 0;
        let yVelocity = 0;
        if (Bullet._isVertical) {
            yVelocity = entity.isPlayer() ? -Bullet._bulletSpeed : Bullet._bulletSpeed;
        } else {
            xVelocity = entity.isPlayer() ? -Bullet._bulletSpeed : Bullet._bulletSpeed;
        }
        velocity.x = xVelocity;
        velocity.y = yVelocity;
        this._velocity = velocity;
    }

    public shoot(entity: IEntity) : void {
        if(entity == null || this._owner == null || entity.isPlayer() == this._owner.isPlayer()) return;
        if(entity.isPlayer()) {
            const player: Player = entity as Player;
            player.hp--;
        } else {
            const enemy: Enemy = entity as Enemy;
            enemy.killedBy(this._owner);
        }
    }

}