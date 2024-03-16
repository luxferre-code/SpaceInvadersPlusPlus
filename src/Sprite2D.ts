/**
 * Describes a 2D element to be displayed in a canvas.
 * This element is called a "sprite".
 * A sprite needs a rendering context
 * and a skin (which is an HTMLImageElement).
 */
export default class {
  protected _context: CanvasRenderingContext2D;
  protected _skin: HTMLImageElement;
  protected _imageLoaded: boolean = false;
  protected _canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, skin: HTMLImageElement) {
    this._canvas = canvas;
    this._context = canvas.getContext('2d')!;
    this._skin = skin;
    this._skin.src = "/assets/skins/skin-red.png";
    this._skin.onload = () => this._imageLoaded = true;
  }

  /**
   * Gets whether or not the skin was loaded.
   * It will return `false` if the image is not yet loaded
   * or if there was an error while loading the file.
   */
  public isSkinLoaded() {
    return this._imageLoaded;
  }
}