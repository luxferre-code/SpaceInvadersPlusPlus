import { Skin, getSkinURL } from "./Skins";
import HitBox from "./HitBox";
import Node2D from "./Node2D";

/**
 * Describes a 2D element to be displayed in a canvas.
 * This element is called a "sprite".
 * A sprite needs a rendering context
 * and a skin (which is an HTMLImageElement).
 */
export default abstract class Sprite2D extends Node2D {
  protected _skin: Skin;
  protected _skinImg: HTMLImageElement;
  protected _imageLoaded: boolean = false;

  constructor(canvas: HTMLCanvasElement, skin: Skin) {
    super(canvas);
    this._skin = skin;
    this._skinImg = new Image();
    this._skinImg.src = getSkinURL(skin);
    this._skinImg.onload = () => this._imageLoaded = true;
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
      this._context.drawImage(this._skinImg, this._position.x, this._position.y, this._skinImg.width, this._skinImg.height);
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
    return new HitBox(this._position, this._skinImg);
  }

  /**
   * Gets whether or not the skin was loaded.
   * It will return `false` if the image is not yet loaded
   * or if there was an error while loading the file.
   */
  public isSkinLoaded() {
    return this._imageLoaded;
  }
  
  public getSkin(): HTMLImageElement { return this._skinImg; }
}