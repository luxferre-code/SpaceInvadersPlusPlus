import { Skin } from "./utils/Skins";
import Bullet from "./Bullet";
import Sprite2D from "./Sprite2D";
import Vector2 from "./Vector2";
/**
 *  This class represents the enemy entity in the game.
 */
export default class Enemy extends Sprite2D {
    static TIMEOUT_SHOOT = 500;
    static _shootProbability = 0.02;
    _gravity;
    _dead = false;
    _hp = 1;
    _scoreToGive = 10;
    _canShoot = true;
    constructor(position, gravity = 2) {
        super(Skin.GREEN);
        this._position = position ?? Enemy.generateRandomSpawnPosition(this._skinImg.width, this._skinImg.height);
        this._gravity = gravity;
    }
    /**
     * This method checks if the entity is a player.
     * @returns True if the entity is a player, false otherwise.
     */
    isPlayer() {
        return false;
    }
    /**
     * This method generates a random spawn position outside of the screen.
     * The enemy spawns above the screen and progressively goes down.
     * The width and height are necessary to make sure the player
     * never sees the enemy spawn suddenly or behind a border.
     * @param width The width of the enemy.
     * @param height The height of the enemy.
     * @returns The random position.
     */
    static generateRandomSpawnPosition(width, height) {
        // return new Vector2(Game.random.nextInt(
        //     Game.limits.minX + 1,
        //     Game.limits.maxX - width
        // ), -height - 10);
        // TODO: remove hard coded value
        return new Vector2(500, 300);
    }
    /**
     * Generates a new random position for the enemy.
     */
    newSpawnPosition() {
        this._position = Enemy.generateRandomSpawnPosition(this._skinImg.width, this._skinImg.height);
    }
    /**
     * This method kills the enemy and increments the general score of the game.
     * @returns True if the enemy is dead, false otherwise.
     */
    die() {
        this._hp--;
        if (this._hp > 0) {
            return false;
        }
        else {
            this._dead = true;
            // Increment score
            // Game.getInstance()?.incrementScore(this._scoreToGive);
            return true;
        }
    }
    shoot() {
        const bullet = new Bullet(this._position);
        bullet.attachTo(this);
        this._canShoot = false;
        setTimeout(() => {
            this._canShoot = true;
        }, Enemy.TIMEOUT_SHOOT);
        // Add bullet
    }
    /**
     * Moves the enemy down at every frame
     * by a fixed amount of pixels (see {@link _gravity}).
     * The enemy also has a small chance of shooting.
     */
    move() {
        this._position.y += this._gravity;
        // if (this._canShoot && Enemy._shootProbability > Game.random.next()) {
        //     this.shoot();
        // }
    }
    /**
     * This method renders the enemy on the canvas.
     */
    render() {
        if (this._dead)
            return;
        super.render();
    }
    isColliding(enemy) {
        const hitBox = this.generateHitBox();
        const otherHitBox = enemy.generateHitBox();
        return hitBox.isColliding(otherHitBox);
    }
    setGravity(gravity) { this._gravity = gravity; }
    isDead() { return this._dead; }
}
