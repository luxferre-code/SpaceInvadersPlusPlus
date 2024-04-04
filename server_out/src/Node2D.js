import Vector2 from "./Vector2";
export default class Node2D {
    _context;
    _canvas;
    _position;
    constructor(canvas) {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
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
    getCanvas() { return this._canvas; }
    getContext() { return this._context; }
}
