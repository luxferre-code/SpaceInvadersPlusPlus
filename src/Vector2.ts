/**
 * Represents coordinates within a 2D space.
 * Can also be used to represent speed, movement and direction.
 */
export default class Vector2 {
  private _x: number = 0;
  private _y: number = 0;

  constructor(x: number = 0, y: number = 0) {
    this._x = x;
    this._y = y;
  }

  public get x() { return this._x; }
  public get y() { return this._y; }
}