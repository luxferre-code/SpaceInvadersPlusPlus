import Bullet from "./Bullet";
import Enemy from "./Enemy";
import IEntity from "./IEntity";

export default class Game {

    private _bullets : Bullet[];
    private _entity : IEntity[];
    private _canvas : HTMLCanvasElement;
    private static instance : Game;

    constructor(canvas: HTMLCanvasElement) {
        this._bullets = [];
        this._entity = [];
        this._canvas = canvas;
        Game.instance = this;
    }

    public get bullets() : Bullet[] { return this._bullets; }
    public get entity() : IEntity[] { return this._entity; }
    public static get this() : Game { return Game.instance; }

    public addBullet(bullet: Bullet) : void {
        if(bullet == null) return;
        this._bullets.push(bullet);
    }

    public addEntity(entity: IEntity) : void {
        if(entity == null) return;
        this._entity.push(entity);
    }

    public removeEntity(entity: IEntity) : void {
        if(entity == null) return;
        console.log("Removing entity " + entity.position.x + " " + entity.position.y);
        this._entity = this._entity.filter(e => e != entity);
    }

    public removeBullet(bullet: Bullet) : void {
        if(bullet == null) return;
        this._bullets = this._bullets.filter(b => b != bullet);
    }

    public updateRender() : void {
        const toDelete : IEntity[] = [];
        this._entity.forEach(e => {
            // Vérification de la mort de l'entité
            if(e.position.x < 0 || e.position.x > this._canvas.width || e.position.y < 0 || e.position.y > this._canvas.height) {
                toDelete.push(e);
            }
            if(!e.isPlayer()) {
                const enemy = e as Enemy;
                if(enemy.isDead) {
                    toDelete.push(e);
                }
            }
            e.render();
        });
        toDelete.forEach(e => {
            this.removeEntity(e);
        });
        this._bullets.forEach(b => {
            if(b.position.x < 0 || b.position.x > this._canvas.width || b.position.y < 0 || b.position.y > this._canvas.height) {
                this.removeBullet(b);
            }
            b.render(this._canvas.getContext("2d")!)
        });
    }

    public updateMove() : void {
        this._entity.forEach(e => e.move());
        this._bullets.forEach(b => b.move());
    }

}