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
    return this.multAxes(scalar, scalar);
  }

  /**
   * Multiplies the vector by a x scaler and a y scaler, and returns the result.
   * @param x - The value to multiply the vector by.
   * @param y - The value to multiply the vector by.
   * @returns A new Vector2 instance with the resulting coordinates.
   */
  public multAxes(x: number, y: number) : Vector2 {
    const result: Vector2 = new Vector2(this._x * x, this._y * y);
    if(result.x < Vector2.range && result.x > -Vector2.range) result._x = 0;
    if(result.y < Vector2.range && result.y > -Vector2.range) result._y = 0;
    return result;
  }

  /**
   * Divides the vector by a scalar and returns the result.
   * @param scalar - The value to divide the vector by.
   * @returns A new Vector2 instance with the resulting coordinates.
   */
  public div(scalar: number) : Vector2 {
    if(scalar === 0) throw new Error('Cannot divide by zero');
    return new Vector2(this._x / scalar, this._y / scalar);
  }

  /**
   * Divides the vector by a x scalar and a y scalar, and returns the result.
   * @param x - The value to divide the vector by.
   * @param y - The value to divide the vector by.
   * @returns A new Vector2 instance with the resulting coordinates.
   */
  public divAxes(x: number, y: number) : Vector2 {
    if(x === 0 || y === 0) throw new Error('Cannot divide by zero');
    return new Vector2(this._x / x, this._y / y);
  }

  /**
   * Returns the magnitude of the vector.
   * @returns The magnitude of the vector.
   */
  public magnitude() : number {
    return Math.sqrt(this._x * this._x + this._y * this._y);
  }

  /**
   * Returns the normalized version of the vector.
   * @returns A new Vector2 instance with the normalized coordinates.
   */
  public normalize() : Vector2 {
    const mag = this.magnitude();
    const vector: Vector2 = new Vector2(this._x / mag, this._y / mag);
    if(Number.isNaN(vector.x)) vector._x = 0;
    if(Number.isNaN(vector.y)) vector._y = 0;
    return vector;
  }

  /**
   * Returns the distance between two vectors.
   * @param vector - The vector to calculate the distance to.
   * @returns The distance between the two vectors.
   */
  public distance(vector: Vector2) : number {
    return vector.sub(this).magnitude();
  }

  /**
   * Returns a copy of the vector.
   * @returns A new Vector2 instance with the same coordinates.
   */
  public copy() : Vector2 {
    return new Vector2(this.x, this.y);
  }

  /**
   * Returns boolean indicating if the vector is equal to another vector.
   * @param vector - The vector to compare to.
   */
  public equals() : boolean {
    return false;
  }

}