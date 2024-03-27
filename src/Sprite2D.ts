import { Skin, getSkinImage } from "./utils/Skins";
import HitBox from "./models/HitBox";
import Node2D from "./Node2D";

/**
 * Describes a 2D element to be displayed in a canvas.
 * This element is called a "sprite".
 * A sprite needs a rendering context
 * and a skin (which is an HTMLImageElement).
 */
export default abstract class Sprite2D extends Node2D {
    protected _skinImg: HTMLImageElement;
    protected _skin: Skin;

    constructor(canvas: HTMLCanvasElement, skin: Skin) {
        super(canvas);
        this._skin = skin;
        this._skinImg = getSkinImage(skin);
    }

    /**
     * Renders the sprite using the canvas API.
     */
    public render(): void {
        this._context.beginPath();
        this._context.drawImage(this._skinImg, this._position.x, this._position.y, this._skinImg.width, this._skinImg.height);
        this._context.fill();
        this._context.closePath();
    }

    /**
     * Generates a basic hitbox.
     */
    public generateHitBox(): HitBox {
        return new HitBox(this._position, this._skinImg);
    }

    public getSkin(): HTMLImageElement { return this._skinImg; }
}
