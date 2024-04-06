import { Skin, getSkinImage } from "./utils/Skins";
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
    }
    static getCanvas() { return this.canvas; }
    static getContext() { return this.context; }
    static isWithinLimits(position) {
        return position.y > this.limits.minY &&
            position.y < this.limits.maxY &&
            position.x > this.limits.minX &&
            position.x < this.limits.maxX;
    }
    static drawUsername(username, x, y) {
        this.context.globalAlpha = 0.2;
        this.context.fillStyle = "white";
        this.context.font = "15px SpaceInvadersFont";
        this.context.textAlign = "center";
        this.context.fillText(username, x, y);
    }
    static renderPlayer(data) {
        const isDead = data.hp <= 0;
        const skinImg = getSkinImage(isDead ? Skin.TOMBSTONE : data.skin);
        const center = data.position.x + skinImg.width / 2;
        const pseudo_y = data.position.y + skinImg.height + 15; // 15 = font size
        this.context.beginPath();
        if (isDead) {
            this.context.globalAlpha = 0.2;
        }
        this.context.drawImage(skinImg, data.position.x, data.position.y, skinImg.width, skinImg.height);
        this.drawUsername(data.username, center, pseudo_y);
        this.context.fillText(data.hp + "x\u{2764}", center, pseudo_y + 15);
        this.context.globalAlpha = 1;
        this.context.fill();
        this.context.closePath();
    }
    static renderBullet(x, y) {
        this.context.fillStyle = "white";
        this.context.beginPath();
        this.context.rect(x, y, 8, 8);
        this.context.fill();
        this.context.closePath();
    }
    static renderEnemy(x, y) {
        const skinImg = getSkinImage(Skin.GREEN);
        this.context.beginPath();
        this.context.drawImage(skinImg, x, y, skinImg.width, skinImg.height);
        this.context.fill();
        this.context.closePath();
    }
}
