import Vector2 from "./Vector2";
export default class Node2D {
    _position;
    constructor() {
        this._position = new Vector2();
    }
    /**
     * Sets the position of the node.
     */
    setPosition(newPosition) {
        this._position = newPosition;
    }
    /**
     * Gets the node's current position.
     */
    getPosition() { return this._position; }
}
