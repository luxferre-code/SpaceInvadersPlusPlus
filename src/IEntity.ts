import Vector2 from "./Vector2";

export default interface IEntity {

    isPlayer() : boolean;

    get position() : Vector2;

}