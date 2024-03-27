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

    /**
     * The maximum amount of enemies that can spawn.
     */
    private static MAX_ENEMIES: number = 5;

    private _score: number = 0;
    private _bullets: Bullet[] = [];
    private _entities: IEntity[] = [];
    private _canvas: HTMLCanvasElement;

    /**
     * The chance that an enemy has to spawn at every frame.
     * An enemy will not spawn if the limit is exceeded
     * (see {@link MAX_ENEMIES}).
     */
    private _spawn_chance: number = 0.01;

    /**
     * Multiplies {@link _spawn_chance} by this amount for an increasing
     * difficulty depending on the player's score. It will get applied
     * every time the player kills an enemy.
     */
    private _score_multiplier: number = 0.00001;

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

    /**
     * Increases the chance that an enemy has to spawn
     * on each frame depending on the player's score.
     * Call this method every time the player
     * kills an enemy.
     */
    private increaseDifficulty() {
        this._spawn_chance = Math.min(this._spawn_chance + this._score * this._score_multiplier, 1);
    }

    private handleBulletCollisions(): void {
        const toRemove: Bullet[] = [];
        this._bullets.forEach(b => {
            this._entities.forEach(e => {
                if (b.getOwner() != e && b.isColliding(e)) {
                    b.shoot(e);
                    if (b.getOwner()?.isPlayer() && !e.isPlayer()) {
                        this.increaseDifficulty();
                    }
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
     * Tries to spawn an enemy if the limit was not reached.
     * It has a small chance of spawning an enemy (see {@link this._spawn_chance}).
     * It makes sure that an enemy will not spawn on top of another one.
     */
    public updateMonsterSpawn(): void {
        if (this.countEnemies() < Game.MAX_ENEMIES && this._spawn_chance > Game.random.next()) {
            const new_enemy = new Enemy(this._canvas);

            // just making sure that the loop never gets stuck indefinitely.
            let i = 0;
            while (this._entities.some(e => e.isColliding(new_enemy))) {
                new_enemy.newSpawnPosition();
                i++;
                if (i >= 50) {
                    break;
                }
            }

            this.addEntity(new_enemy);
        }
    }

    /**
     * Counts the number of enemies.
     */
    private countEnemies(): number {
        return this._entities.filter(e => !e.isPlayer()).length;
    }

    /**
     * This method checks if the game is over.
     * @returns true if the game is over, false otherwise.
     */
    public gameOver(): boolean {
        for (const entity of this._entities) {
            if (entity.isPlayer() && entity.getHealth() <= 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * This method resets the game.
     */
    public reset(): void {
        this._score = 0;
        this._entities = [];
        this._bullets = [];
    }
}
