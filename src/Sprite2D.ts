import { Skin, getSkinImage } from "./utils/Skins";
import HitBox from "./models/HitBox";
import Node2D from "./Node2D";
import GameClient from "./GameClient";

/**
 * Describes a 2D element to be displayed in a canvas.
 * This element is called a "sprite".
 * A sprite needs a rendering context
 * and a skin (which is an HTMLImageElement).
 */
export default abstract class Sprite2D extends Node2D {
    protected _skinImg: HTMLImageElement;
    protected _skin: Skin;

    constructor(skin: Skin) {
        super();
        this._skin = skin;
        this._skinImg = getSkinImage(skin);
    }

    /**
     * Renders the sprite using the canvas API.
     */
    public render(): void {
        GameClient.getContext().beginPath();
        GameClient.getContext().drawImage(this._skinImg, this._position.x, this._position.y, this._skinImg.width, this._skinImg.height);
        GameClient.getContext().fill();
        GameClient.getContext().closePath();
    }

    /**
     * Generates a basic hitbox.
     */
    public generateHitBox(): HitBox {
        return new HitBox(this._position, this._skinImg.width, this._skinImg.height);
    }

    /**
     * Sets the new skin of the sprite.
     */
    public setSkin(skin: Skin) {
        if (skin != this._skin) {
            this._skin = skin;
            this._skinImg = getSkinImage(skin);
        }
    }

    public getSkin(): HTMLImageElement { return this._skinImg; }
}
