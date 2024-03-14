import Enemy from "./Enemy";
import HitBox from "./HitBox";
import IEntity from "./IEntity";
import Player from "./Player";
import Vector2 from "./Vector2";

/**
 * Bullet class  -   This class represents a bullet in the game.
 * 
 * @author Valentin THUILLIER <valentin.thuillier.etu@univ-lille.fr>
 * @version 1.0.0
 */
export default class Bullet {

    private _position: Vector2;
    private _velocity: Vector2;
    private _owner : any;
    private _image: HTMLImageElement;
    private _imageLoaded: boolean = false;
    public static _isVertical: boolean = true;
    public static _bulletSpeed: number = 30;

    constructor(position: Vector2 = new Vector2(0, 0), velocity: Vector2 = new Vector2(!Bullet._isVertical ? Bullet._bulletSpeed : 0, Bullet._isVertical ? -Bullet._bulletSpeed : 0)) {
        this._position = position;
        this._velocity = velocity;
        this._image = new Image();
        this._image.src = "assets/bullet.png";
        this._image.onload = () => {
            this._imageLoaded = true;
        }
    }

    public get position() : Vector2 { return this._position; }
    public get velocity() : Vector2 { return this._velocity; }
    public get owner() : any { return this._owner; }

    /**
     * This method attach this bullet to an entity and set its position and velocity.
     * @param entity    {IEntity}   -   The entity to attach the bullet to.
     */
    public attachTo(entity: IEntity) : void {
        this._owner = entity;
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
     * @param entity    {IEntity}   -   The entity to shoot.
     * @returns     {void}
     */
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

    public render(context: CanvasRenderingContext2D) : void {
        if(!this._imageLoaded) {
            context.fillStyle = "white";
            context.beginPath();
            context.arc(this._position.add(new Vector2(5, 0)).x, this._position.y, 5, 0, 2 * Math.PI);
            context.fill();
            context.closePath();
        }
    }

    public move() : void {
        this._position = this.position.add(this.velocity);
    }

    public isColliding(entity: IEntity) : boolean {
        if(this._owner == entity) return false;
        if(this._owner.isPlayer() == entity.isPlayer()) return false;
        const hitBox: HitBox = this.genereHitBox();
        const entityHitBox: HitBox = entity.genereHitBox();
        return this.isCollidingWithHitBox(hitBox, entityHitBox);
    }

    private genereHitBox() : HitBox {
        return {
            top_left : new Vector2(this.position.x, this.position.y),
            top_right : new Vector2(this.position.x + this._image.width, this.position.y),
            bottom_left : new Vector2(this.position.x, this.position.y + this._image.height),
            bottom_right : new Vector2(this.position.x + this._image.width, this.position.y + this._image.height)
        };
    }

    private isCollidingWithHitBox(hitBox: HitBox, entityHitBox: HitBox) : boolean {
        return this.isCollidingWithPoint(hitBox.top_left, entityHitBox) || this.isCollidingWithPoint(hitBox.top_right, entityHitBox) || this.isCollidingWithPoint(hitBox.bottom_left, entityHitBox) || this.isCollidingWithPoint(hitBox.bottom_right, entityHitBox);
    }

    private isCollidingWithPoint(point: Vector2, entityHitBox: HitBox) : boolean {
        return point.x >= entityHitBox.top_left.x && point.x <= entityHitBox.top_right.x && point.y >= entityHitBox.top_left.y && point.y <= entityHitBox.bottom_left.y;
    }

}