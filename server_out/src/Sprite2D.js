import { getSkinImage } from "./utils/Skins";
import HitBox from "./models/HitBox";
import Node2D from "./Node2D";
/**
 * Describes a 2D element to be displayed in a canvas.
 * This element is called a "sprite".
 * A sprite needs a rendering context
 * and a skin (which is an HTMLImageElement).
 */
export default class Sprite2D extends Node2D {
    _skinImg;
    _skin;
    constructor(canvas, skin) {
        super(canvas);
        this._skin = skin;
        this._skinImg = getSkinImage(skin);
    }
    /**
     * Renders the sprite using the canvas API.
     */
    render() {
        this._context.beginPath();
        this._context.drawImage(this._skinImg, this._position.x, this._position.y, this._skinImg.width, this._skinImg.height);
        this._context.fill();
        this._context.closePath();
    }
    /**
     * Generates a basic hitbox.
     */
    generateHitBox() {
        return new HitBox(this._position, this._skinImg.width, this._skinImg.height);
    }
    /**
     * Sets the new skin of the sprite.
     */
    setSkin(skin) {
        if (skin != this._skin) {
            this._skin = skin;
            this._skinImg = getSkinImage(skin);
        }
    }
    getSkin() { return this._skinImg; }
}
