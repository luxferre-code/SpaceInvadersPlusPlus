import Vector2 from "./Vector2";

/**
 * This interface represents an entity in the game.
 */
export default interface IEntity {
    isPlayer() : boolean;

    getPosition() : Vector2;

    get canvas() : HTMLCanvasElement;
    get context() : CanvasRenderingContext2D;
    get image() : HTMLImageElement;
}