import HitBox from "./HitBox";
import Player from "./Player";
import Vector2 from "./Vector2";

/**
 * This interface represents an entity in the game.
 */
export default interface IEntity {
    // If this function returns true,
    // then TypeScript will understand
    // that the callee is of type Player.
    isPlayer() : this is Player;

    getPosition() : Vector2;
    render() : void;
    move() : void;
    generateHitBox() : HitBox;
}