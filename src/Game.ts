import Bullet from "./Bullet";
import Enemy from "./Enemy";
import IEntity from "./IEntity";
import Player from "./Player";

export default class Game {
    private static instance : Game;

    private _bullets : Bullet[] = [];
    private _entities : IEntity[] = [];
    private _canvas : HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        Game.instance = this;
    }

    public get bullets() : Bullet[] { return this._bullets; }
    public get entities() : IEntity[] { return this._entities; }
    public static getInstance(): Game { return this.instance; }

    public addBullet(bullet: Bullet) : void {
        if(bullet == null) return;
        this._bullets.push(bullet);
    }

    public addEntity(entity: IEntity) : void {
        if(entity == null) return;
        this._entities.push(entity);
    }

    public removeEntity(entity: IEntity) : void {
        if(entity == null) return;
        console.log("Removing entity " + entity.getPosition().toString());
        this._entities = this._entities.filter(e => e != entity);
    }

    public removeBullet(bullet: Bullet) : void {
        if(bullet == null) return;
        this._bullets = this._bullets.filter(b => b != bullet);
    }

    public updateRender() : void {
        this.purgeBullet();
        this.purgeEntity();
        this.bulletHit();
        this._entities.forEach(e => e.render());
        this._bullets.forEach(b => b.render());
    }

    private purgeBullet() : void {
        this._bullets = this._bullets.filter(b => b.position.x > 0 && b.position.x < this._canvas.width && b.position.y > 0 && b.position.y < this._canvas.height);
    }

    private purgeEntity() : void {
        this._entities = this._entities.filter(e => {
            const eX = e.getPosition().x;
            const eY = e.getPosition().y;
            if(eX < 0 || eX > this._canvas.width || eY < 0 || eY > this._canvas.height) {
                console.log("Removing entity " + eX + " " + eY);
                return false;
            }
            if(!e.isPlayer()) {
                const enemy = e as Enemy;
                if(enemy.isDead) {
                    return false;
                }
            }
            return true;
        });
    }

    private bulletHit() : void {
        const toRemove : Bullet[] = [];
        this._bullets.forEach(b => {
            this._entities.forEach(e => {
                if(b.owner == e) return;
                if(b.isColliding(e)) {
                    b.shoot(e);
                    toRemove.push(b);
                }
            });
        });
        toRemove.forEach(b => this.removeBullet(b));
    }

    public updateMove() : void {
        this._entities.forEach(e => e.move());
        this._bullets.forEach(b => {
            b.move();
        });
    }

    public getScore() : number {
        let score = 0;
        this._entities.forEach(e => {
            if(e.isPlayer()) {
                const player = e as Player;
                score += player.score;
            }
        });
        return score;
    }
}