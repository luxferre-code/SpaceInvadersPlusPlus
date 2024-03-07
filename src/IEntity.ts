import Vector2 from "./Vector2";

/**
 * IEntity interface  -   This interface represents an entity in the game.
 * @author Valentin THUILLIER <valentin.thuillier.etu@univ-lille.fr>
 * @version 1.0.0
 */
export default interface IEntity {

    isPlayer() : boolean;

    get position() : Vector2;
    get canvas() : HTMLCanvasElement;
    get context() : CanvasRenderingContext2D;
    get image() : HTMLImageElement;

}