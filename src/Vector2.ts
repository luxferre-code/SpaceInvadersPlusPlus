/**
 * Represents coordinates within a 2D space.
 * Can also be used to represent speed, movement and direction.
 */
export default class Vector2 {
  private _x: number;
  private _y: number;
  private static readonly range = 0.01;

  /**
   * Creates a new Vector2 instance.
   * @param [x=0] - The x coordinate.
   * @param [y=0] - The y coordinate
   */
  constructor(x: number = 0, y: number = 0) {
    this._x = x;
    this._y = y;
  }

  public get x() { return this._x; }
  public get y() { return this._y; }

  /**
   * Adds two vectors together and returns the result.
   * @param vector - The vector to add to this one.
   * @returns A new Vector2 instance with the resulting coordinates.
   */
  public add(vector: Vector2) : Vector2 {
    return new Vector2(this._x + vector.x, this._y + vector.y);
  }

  /**
   * Subtracts two vectors and returns the result.
   * @param vector - The vector to subtract from this one.
   * @returns A new Vector2 instance with the resulting coordinates.
   */
  public sub(vector: Vector2) : Vector2 {
    return new Vector2(this._x - vector.x , this._y - vector.y);
  }

  /**
   * Multiplies the vector by a scalar and returns the result.
   * @param scalar - The value to multiply the vector by.
   * @returns A new Vector2 instance with the resulting coordinates.
   */
  public mult(scalar: number) : Vector2 {
    const result: Vector2 = new Vector2(this._x * scalar, this._y * scalar);
    if(result.x < Vector2.range && result.x > -Vector2.range) result._x = 0;
    if(result.y < Vector2.range && result.y > -Vector2.range) result._y = 0;
    return result;
  }

  /**
   * Multiplies the vector by a x scaler and a y scaler, and returns the result.
   * @param x - The value to multiply the vector by.
   * @param y - The value to multiply the vector by.
   * @returns A new Vector2 instance with the resulting coordinates.
   */
  public multAxes(x: number, y: number) : Vector2 {
    return new Vector2(this._x * x, this._y * y);
  }

}