import GameClient from "./GameClient";
import HitBox from "./models/HitBox";
import Node2D from "./Node2D";
import Vector2 from "./Vector2";
/**
 * This class represents a bullet in the game.
 */
export default class Bullet extends Node2D {
    static _isVertical = true;
    static _bulletSpeed = 10;
    _velocity;
    _owner = null;
    size = 10;
    constructor(position = new Vector2(), velocity = new Vector2(!Bullet._isVertical ? Bullet._bulletSpeed : 0, Bullet._isVertical ? -Bullet._bulletSpeed : 0)) {
        super();
        this._position = position;
        this._velocity = velocity;
    }
    getVelocity() { return this._velocity; }
    getOwner() { return this._owner; }
    /**
     * This method attach this bullet to an entity and set its position and velocity.
     * @param entity  The entity to attach the bullet to.
     */
    attachTo(entity) {
        if (entity == null)
            return;
        this._owner = entity;
        this._position = entity.getPosition();
        const velocity = new Vector2();
        let xVelocity = 0;
        let yVelocity = 0;
        if (Bullet._isVertical) {
            yVelocity = entity.isPlayer() ? -Bullet._bulletSpeed : Bullet._bulletSpeed;
        }
        else {
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
    shoot(entity) {
        if (entity == null || this._owner == null || entity.isPlayer() == this._owner.isPlayer())
            return;
        if (entity.isPlayer()) {
            entity.hurt();
        }
        else {
            if (this._owner.isPlayer()) {
                entity.die();
            }
            else {
                console.warn("hummmm, todo...."); // TODO: pretty sure we have to do something here
            }
        }
    }
    render() {
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
    move() {
        this._position = this._position.add(this._velocity);
    }
    isColliding(entity) {
        if (this._owner == entity)
            return false;
        if (this._owner?.isPlayer() == entity.isPlayer())
            return false;
        const hitBox = this.genereHitBox();
        const entityHitBox = entity.generateHitBox();
        return this.isCollidingWithHitBox(hitBox, entityHitBox);
    }
    genereHitBox() {
        return new HitBox(this._position, this.size, this.size);
    }
    isCollidingWithHitBox(hitBox, entityHitBox) {
        return this.isCollidingWithPoint(hitBox.top_left, entityHitBox) ||
            this.isCollidingWithPoint(hitBox.top_right, entityHitBox) ||
            this.isCollidingWithPoint(hitBox.bottom_left, entityHitBox) ||
            this.isCollidingWithPoint(hitBox.bottom_right, entityHitBox);
    }
    isCollidingWithPoint(point, entityHitBox) {
        return point.x >= entityHitBox.top_left.x &&
            point.x <= entityHitBox.top_right.x &&
            point.y >= entityHitBox.top_left.y &&
            point.y <= entityHitBox.bottom_left.y;
    }
}
