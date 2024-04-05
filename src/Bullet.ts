import Enemy from "./Enemy";
import GameClient from "./GameClient";
import HitBox from "./models/HitBox";
import Node2D from "./Node2D";
import Vector2 from "./Vector2";

/**
 * This class represents a bullet in the game.
 */
export default class Bullet extends Node2D {
    public static _isVertical: boolean = true;
    public static _bulletSpeed: number = 10;

    private _velocity: Vector2;
    private _owner : IEntity | null = null;
    private size: number = 10;

    constructor(position: Vector2 = new Vector2(), velocity: Vector2 = new Vector2(!Bullet._isVertical ? Bullet._bulletSpeed : 0, Bullet._isVertical ? -Bullet._bulletSpeed : 0)) {
        super();
        this._position = position;
        this._velocity = velocity;
    }

    public getVelocity(): Vector2 { return this._velocity; }
    public getOwner(): IEntity | null { return this._owner; }

    /**
     * This method attach this bullet to an entity and set its position and velocity.
     * @param entity  The entity to attach the bullet to.
     */
    public attachTo(entity: IEntity) : void {
        if(entity == null) return;
        this._owner = entity;
        this._position = entity.getPosition();
        const velocity: Vector2 = new Vector2();
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
     */
    public shoot(entity: IEntity) : void {
        if(entity == null || this._owner == null || entity.isPlayer() == this._owner.isPlayer()) return;
        if(entity.isPlayer()) {
            entity.hurt();
        } else {
            if (this._owner.isPlayer()) {
                (entity as Enemy).die();
            } else {
                console.warn("hummmm, todo...."); // TODO: pretty sure we have to do something here
            }
        }
    }

    public render() : void {
        GameClient.getContext().fillStyle = "white";
        GameClient.getContext().beginPath();
        // How to place the bullet:
        // The current position at the top left corner (this._position.x)
        // + the width of the skin
        // - half the size of the bullet
        GameClient.getContext().rect(this._position.x + 25 - 4, this._position.y, 8, 8);
        GameClient.getContext().fill();
        GameClient.getContext().closePath();
    }

    public move() : void {
        this._position = this._position.add(this._velocity);
    }

    public isColliding(entity: IEntity) : boolean {
        if(this._owner == entity) return false;
        if(this._owner?.isPlayer() == entity.isPlayer()) return false;
        const hitBox: HitBox = this.genereHitBox();
        const entityHitBox: HitBox = entity.generateHitBox();
        return this.isCollidingWithHitBox(hitBox, entityHitBox);
    }

    private genereHitBox() : HitBox {
        return new HitBox(this._position, this.size, this.size);
    }

    private isCollidingWithHitBox(hitBox: HitBox, entityHitBox: HitBox) : boolean {
        return this.isCollidingWithPoint(hitBox.top_left, entityHitBox) ||
            this.isCollidingWithPoint(hitBox.top_right, entityHitBox) ||
            this.isCollidingWithPoint(hitBox.bottom_left, entityHitBox) ||
            this.isCollidingWithPoint(hitBox.bottom_right, entityHitBox);
    }

    private isCollidingWithPoint(point: Vector2, entityHitBox: HitBox) : boolean {
        return point.x >= entityHitBox.top_left.x &&
        point.x <= entityHitBox.top_right.x &&
        point.y >= entityHitBox.top_left.y &&
        point.y <= entityHitBox.bottom_left.y;
    }
}
