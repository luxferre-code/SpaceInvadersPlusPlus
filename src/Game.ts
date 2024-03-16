import Bullet from "./Bullet";
import Enemy from "./Enemy";
import IEntity from "./IEntity";

export default class Game {
    private static instance : Game;

    private _score: number = 0;
    private _bullets : Bullet[] = [];
    private _entities : IEntity[] = [];
    private _canvas : HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        Game.instance = this;
    }

    public getBullets(): Bullet[] { return this._bullets; }
    public getEntities(): IEntity[] { return this._entities; }
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
        this._bullets = this._bullets.filter(b => {
            const bX = b.getPosition().x;
            const bY = b.getPosition().y;
            return bX > 0 && bX < this._canvas.width && bY > 0 && bY < this._canvas.height;
        });
    }

    private purgeEntity() : void {
        this._entities = this._entities.filter(e => {
            const eX = e.getPosition().x;
            const eY = e.getPosition().y;
            if (eX < 0 || eX > this._canvas.width || eY < 0 || eY > this._canvas.height) {
                console.log("Removing entity " + eX + " " + eY);
                return false;
            }
            if (!e.isPlayer()) {
                const enemy = e as Enemy;
                if(enemy.isDead()) {
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
                if(b.getOwner() == e) return;
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

    /**
     * Method to increase the player's score
     * @param scoreAdded The score to add
     */
    public incrementScore(scoreAdded: number) : void {
        this._score += scoreAdded;
    }

    public getScore() : number {
        return this._score;
    }
}