import type Vector2 from "./Vector2";
import Random from "./utils/Random";
import Bullet from "./Bullet";
import Enemy from "./Enemy";

export default class Game {
    private static instance: Game;

    /**
     * The unique Random instance that should be shared across the whole game,
     * and defined only in `main.ts` when the first instance of Game is instantiated.
     */
    public static random: Random;

    /**
     * Gets the maximum and minimum X and Y coordinates that an entity can have
     * to be considered still within the boundaries of the game. An entity outside of
     * these boundaries should be removed and the player should bounce off of them.
     */
    public static limits: GameLimits = { maxX: 0, maxY: 0, minX: 0, minY: 0 };

    private _score: number = 0;
    private _bullets: Bullet[] = [];
    private _entities: IEntity[] = [];
    private _canvas: HTMLCanvasElement;
    private static MINIMAL_SPAWN: number = 3;

    constructor(canvas: HTMLCanvasElement) {
        Game.instance = this;
        this._canvas = canvas;
    }

    public static getInstance(): Game { return this.instance; }

    public static isWithinLimits(position: Vector2): boolean {
        return position.y > Game.limits.minY &&
            position.y < Game.limits.maxY &&
            position.x > Game.limits.minX &&
            position.x < Game.limits.maxX;
    }

    /**
     * This function is very similar to {@link isWithinLimits} as it checks
     * if a given position is within the game's limits. However, since we want
     * the enemies to spawn above the top Y border, we wouldn't want them to be
     * immediately purged as soon as they'd spawn.
     */
    public static shouldDispawn(position: Vector2): boolean {
        return position.y > Game.limits.maxY ||
            position.x > Game.limits.maxX ||
            position.x < Game.limits.minX;
    }

    public getBullets(): Bullet[] { return this._bullets; }
    public getEntities(): IEntity[] { return this._entities; }

    public addBullet(bullet: Bullet): void {
        this._bullets.push(bullet);
    }

    public addEntity(entity: IEntity): void {
        this._entities.push(entity);
    }

    public removeEntity(entity: IEntity): void {
        console.log("Removing entity " + entity.getPosition().toString());
        this._entities = this._entities.filter(e => e != entity);
    }

    public removeBullet(bullet: Bullet): void {
        this._bullets = this._bullets.filter(b => b != bullet);
    }

    public updateRender(): void {
        this.purgeBullet();
        this.purgeEntity();
        this.handleBulletCollisions();
        this._entities.forEach(e => e.render());
        this._bullets.forEach(b => b.render());
    }

    private purgeBullet(): void {
        this._bullets = this._bullets.filter(b => Game.isWithinLimits(b.getPosition()));
    }

    private purgeEntity(): void {
        this._entities = this._entities.filter(e => {
            if (Game.shouldDispawn(e.getPosition())) {
                console.log("Removing entity " + e.getPosition().toString());
                return false;
            }
            if (!e.isPlayer()) {
                if ((e as Enemy).isDead()) {
                    return false;
                }
            }
            return true;
        });
    }

    private handleBulletCollisions(): void {
        const toRemove: Bullet[] = [];
        this._bullets.forEach(b => {
            this._entities.forEach(e => {
                if (b.getOwner() != e && b.isColliding(e)) {
                    b.shoot(e);
                    toRemove.push(b);
                }
            });
        });
        toRemove.forEach(b => this.removeBullet(b));
    }

    public updateMove(): void {
        this._entities.forEach(e => e.move());
        this._bullets.forEach(b => b.move());
    }

    /**
     * Method to increase the player's score
     * @param scoreAdded The score to add
     */
    public incrementScore(scoreAdded: number): void {
        this._score += scoreAdded;
    }

    public getScore(): number {
        return this._score;
    }

    /**
     * This method updates the spawn rate of the monsters.
     * @returns     Nothing
     */
    public updateMonsterSpawn(): void {
        console.log(1 + (this._score / 100));
        for(let i: number = 0; i < Game.random.nextInt(-1, 2 + (this._score / 100)); i++) {
            if (!this.limitSpawnRate()) { return; }
            const enemy = new Enemy(this._canvas);

            // Check if the enemy is not spawning on a another entity
            while(this._entities.some(e => e.isColliding(enemy))) {
                enemy.setPosition(Enemy.generateRandomSpawnPosition(this._canvas.width, this._canvas.height));
            }

            console.log("Spawning enemy at " + enemy.getPosition().toString());
            this.addEntity(enemy);
        }
    }

    /**
     * This method limits the spawn rate of the enemies.
     * @returns     True if the spawn rate is not limited, false otherwise.
     */
    private limitSpawnRate() : boolean {
        return this._entities.filter(e => !e.isPlayer()).length < Game.MINIMAL_SPAWN + (this._score / 100);
    }

    /**
     * This method checks if the game is over.
     * @returns     True if the game is over, false otherwise.
     */
    public gameOver() : boolean {
        for(const entity of this._entities) {
            if (entity.isPlayer() && entity.getHealth() <= 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * This method resets the game.
     * @returns     Nothing
     */
    public reset() : void {
        this._score = 0;
        this._entities = [];
        this._bullets = [];
    }

}
