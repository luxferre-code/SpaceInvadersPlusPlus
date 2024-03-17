import type Vector2 from "./Vector2";
import Bullet from "./Bullet";
import Enemy from "./Enemy";

export default class Game {
    private static instance : Game;

    /**
     * Gets the maximum and minimum X and Y coordinates that an entity can have
     * to be considered still within the boundaries of the game. An entity outside of
     * these boundaries should be removed and the player should bounce off of them.
     */
    public static limits: GameLimits = { maxX: 0, maxY: 0, minX: 0, minY: 0 };

    private _score: number = 0;
    private _bullets : Bullet[] = [];
    private _entities : IEntity[] = [];

    constructor() {
        Game.instance = this;
    }

    public static getInstance(): Game { return this.instance; }

    public static isWithinLimits(position: Vector2): boolean {
        return position.y > Game.limits.minY &&
            position.y < Game.limits.maxY &&
            position.x > Game.limits.minX &&
            position.x < Game.limits.maxX;
    }

    public getBullets(): Bullet[] { return this._bullets; }
    public getEntities(): IEntity[] { return this._entities; }


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
        this._bullets = this._bullets.filter(b => Game.isWithinLimits(b.getPosition()));
    }

    private purgeEntity() : void {
        this._entities = this._entities.filter(e => {
            if (!Game.isWithinLimits(e.getPosition())) {
                console.log("Removing entity " + e.getPosition().toString());
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