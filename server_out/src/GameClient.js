import { getSkinImage } from "./utils/Skins";
export default class GameClient {
    static canvas = undefined;
    static context = undefined;
    /**
     * Gets the maximum and minimum X and Y coordinates that an entity can have
     * to be considered still within the boundaries of the game. An entity outside of
     * these boundaries should be removed and the player should bounce off of them.
     */
    static limits = { maxX: 0, maxY: 0, minX: 0, minY: 0 };
    static initWith(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        console.log("context initialized", this.context);
    }
    static getCanvas() { return this.canvas; }
    static getContext() { return this.context; }
    static getCanvasDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    static isWithinLimits(position) {
        return position.y > this.limits.minY &&
            position.y < this.limits.maxY &&
            position.x > this.limits.minX &&
            position.x < this.limits.maxX;
    }
    static renderPlayer(x, y, skin) {
        const skinImg = getSkinImage(skin);
        this.context.beginPath();
        this.context.drawImage(skinImg, x, y, skinImg.width, skinImg.height);
        this.context.fill();
        this.context.closePath();
    }
}
