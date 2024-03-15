import Enemy from "./Enemy";
import IEntity from "./IEntity";
import Player from "./Player";
import Sprite2D from "./Sprite2D";
import Vector2 from "./Vector2";

/**
 * This class represents a bullet in the game.
 */
export default class Bullet extends Sprite2D {
    public static _isVertical: boolean = true;
    public static _bulletSpeed: number = 10;

    private _position: Vector2;
    private _velocity: Vector2;
    private _owner : any;

    constructor(canvas: HTMLCanvasElement, position: Vector2 = new Vector2(0, 0), velocity: Vector2 = new Vector2(!Bullet._isVertical ? Bullet._bulletSpeed : 0, Bullet._isVertical ? -Bullet._bulletSpeed : 0)) {
        super(canvas, new Image()); //TODO: Add the image of the bullet
        this._position = position;
        this._velocity = velocity;
        this._owner = null;
    }

    public get position() : Vector2 { return this._position; }
    public get velocity() : Vector2 { return this._velocity; }
    public get owner() : any { return this._owner; }

    /**
     * This method attach this bullet to an entity and set its position and velocity.
     * @param entity  The entity to attach the bullet to.
     */
    public attachTo(entity: IEntity) : void {
        if(entity == null) return;
        this._owner = entity;
        this._position = entity.getPosition();
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

    /**
     * This method shoot an entity.
     * @param entity The entity to shoot.
     * @returns
     */
    public shoot(entity: IEntity) : void {
        if(entity == null || this._owner == null || entity.isPlayer() == this._owner.isPlayer()) return;
        if(entity.isPlayer()) {
            const player: Player = entity as Player;
            player.hurt();
        } else {
            const enemy: Enemy = entity as Enemy;
            enemy.die(this._owner);
        }
    }

    public get canvas() : HTMLCanvasElement { return this._canvas; }
    public get image() : HTMLImageElement { return this._skin; }

}