import Enemy from "./Enemy";
export default class Game {
    static instance;
    /**
     * The unique Random instance that should be shared across the whole game,
     * and defined only in `main.ts` when the first instance of Game is instantiated.
     */
    static random;
    /**
     * Gets the maximum and minimum X and Y coordinates that an entity can have
     * to be considered still within the boundaries of the game. An entity outside of
     * these boundaries should be removed and the player should bounce off of them.
     */
    static limits = { maxX: 0, maxY: 0, minX: 0, minY: 0 };
    /**
     * The maximum amount of enemies that can spawn.
     */
    static MAX_ENEMIES = 5;
    _score = 0;
    _bullets = [];
    _entities = [];
    _canvas;
    /**
     * The chance that an enemy has to spawn at every frame.
     * An enemy will not spawn if the limit is exceeded
     * (see {@link MAX_ENEMIES}).
     */
    _spawn_chance = 0.01;
    /**
     * Multiplies {@link _spawn_chance} by this amount for an increasing
     * difficulty depending on the player's score. It will get applied
     * every time the player kills an enemy.
     */
    _score_multiplier = 0.00001;
    constructor(canvas) {
        Game.instance = this;
        this._canvas = canvas;
    }
    static getInstance() { return this.instance; }
    static isWithinLimits(position) {
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
    static shouldDispawn(position) {
        return position.y > Game.limits.maxY ||
            position.x > Game.limits.maxX ||
            position.x < Game.limits.minX;
    }
    getBullets() { return this._bullets; }
    getEntities() { return this._entities; }
    addBullet(bullet) {
        this._bullets.push(bullet);
    }
    addEntity(entity) {
        this._entities.push(entity);
    }
    removeEntity(entity) {
        this._entities = this._entities.filter(e => e != entity);
    }
    removeBullet(bullet) {
        this._bullets = this._bullets.filter(b => b != bullet);
    }
    updateRender() {
        this.purgeBullet();
        this.purgeEntity();
        this.handleBulletCollisions();
        this._entities.forEach(e => e.render());
        this._bullets.forEach(b => b.render());
    }
    purgeBullet() {
        this._bullets = this._bullets.filter(b => Game.isWithinLimits(b.getPosition()));
    }
    purgeEntity() {
        this._entities = this._entities.filter(e => {
            if (Game.shouldDispawn(e.getPosition())) {
                return false;
            }
            if (!e.isPlayer()) {
                if (e.isDead()) {
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
    increaseDifficulty() {
        this._spawn_chance = Math.min(this._spawn_chance + this._score * this._score_multiplier, 1);
    }
    handleBulletCollisions() {
        const toRemove = [];
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
    updateMove() {
        this._entities.forEach(e => e.move());
        this._bullets.forEach(b => b.move());
    }
    /**
     * Method to increase the player's score
     * @param scoreAdded The score to add
     */
    incrementScore(scoreAdded) {
        this._score += scoreAdded;
    }
    getScore() {
        return this._score;
    }
    /**
     * Tries to spawn an enemy if the limit was not reached.
     * It has a small chance of spawning an enemy (see {@link this._spawn_chance}).
     * It makes sure that an enemy will not spawn on top of another one.
     */
    updateMonsterSpawn() {
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
    countEnemies() {
        return this._entities.filter(e => !e.isPlayer()).length;
    }
    /**
     * This method checks if the game is over.
     * @returns true if the game is over, false otherwise.
     */
    gameOver() {
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
    reset() {
        this._score = 0;
        this._entities = [];
        this._bullets = [];
    }
}
