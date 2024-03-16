import HitBox from "./HitBox";
import Node2D from "./Node2D";

/**
 * Describes a 2D element to be displayed in a canvas.
 * This element is called a "sprite".
 * A sprite needs a rendering context
 * and a skin (which is an HTMLImageElement).
 */
export default abstract class Sprite2D extends Node2D {
  protected _skin: HTMLImageElement;
  protected _imageLoaded: boolean = false;

  constructor(canvas: HTMLCanvasElement, skin: HTMLImageElement) {
    super(canvas);
    this._skin = skin;
    this._skin.src = "/assets/skins/skin-red.png";
    this._skin.onload = () => this._imageLoaded = true;
  }

  public abstract fallbackRender(): void;

  /**
   * Renders the sprite using the canvas API.
   * If the image isn't loaded, the fallback is rendered.
   * 
   * @see {@link fallbackRender}
   */
  public render(): void {
    if (this.isSkinLoaded()) {
      this._context.beginPath();
      this._context.drawImage(this._skin, this._position.x, this._position.y, this._skin.width, this._skin.height);
      this._context.fill();
      this._context.closePath();
    } else {
      this.fallbackRender();
    }
  }

  /**
   * Generates a basic hitbox.
   */
  public generateHitBox(): HitBox {
    return new HitBox(this._position, this._skin);
  }

  /**
   * Gets whether or not the skin was loaded.
   * It will return `false` if the image is not yet loaded
   * or if there was an error while loading the file.
   */
  public isSkinLoaded() {
    return this._imageLoaded;
  }
  
  public getSkin(): HTMLImageElement { return this._skin; }
}