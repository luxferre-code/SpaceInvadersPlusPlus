import Vector2 from "./Vector2";

export default abstract class Node2D {
  protected _context: CanvasRenderingContext2D;
  protected _canvas: HTMLCanvasElement;
  protected _position: Vector2;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._context = canvas.getContext('2d')!;
    this._position = new Vector2();
  }

  /**
   * Shows something to the screen using the Canvas API.
   */
  public abstract render(): void;

  /**
   * Sets the position of the node.
   */
  public setPosition(newPosition: Vector2) {
    this._position = newPosition;
  }

  /**
   * Gets the node's current position.
   */
  public getPosition(): Vector2 { return this._position; }
  public getCanvas(): HTMLCanvasElement { return this._canvas; }
  public getContext(): CanvasRenderingContext2D { return this._context; }
}
