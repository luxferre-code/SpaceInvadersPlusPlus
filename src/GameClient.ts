import { PowerupImages } from "./utils/Powerups";
import { Skin, getSkinImage } from "./utils/Skins";

export default class GameClient {
    private static canvas: HTMLCanvasElement | undefined = undefined;
    private static context: CanvasRenderingContext2D | undefined = undefined;

    /**
     * Gets the maximum and minimum X and Y coordinates that an entity can have
     * to be considered still within the boundaries of the game. An entity outside of
     * these boundaries should be removed and the player should bounce off of them.
     */
    public static limits: GameLimits = { maxX: 0, maxY: 0, minX: 0, minY: 0 };

    public static initWith(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
    }

    public static getCanvas(): HTMLCanvasElement { return this.canvas!; }
    public static getContext(): CanvasRenderingContext2D { return this.context!; }

    public static isWithinLimits(position: Readonly<Vec2>): boolean {
        return position.y > this.limits.minY &&
            position.y < this.limits.maxY &&
            position.x > this.limits.minX &&
            position.x < this.limits.maxX;
    }

    private static drawUsername(username: string, x: number, y: number) {
        this.context!.globalAlpha = 0.64;
        this.context!.fillStyle = "white";
        this.context!.font = "15px SpaceInvadersFont";
        this.context!.textAlign = "center";
        this.context!.fillText(username, x, y);
    }

    public static renderPlayer(data: Readonly<PlayerData>) {
        const isDead = data.hp <= 0;
        const skinImg = getSkinImage(isDead ? Skin.TOMBSTONE : data.skin);
        const center = data.position.x + skinImg.width / 2;
        const pseudo_y = data.position.y + skinImg.height + 15; // 15 = font size
        if (isDead) {
            this.context!.globalAlpha = 0.2;
        } else {
            if (data.immune) {
                this.context!.filter = "brightness(0) invert(1)";
            }
        }
        this.context!.beginPath();
        this.context!.drawImage(skinImg, data.position.x, data.position.y, skinImg.width, skinImg.height);
        this.drawUsername(data.username, center, pseudo_y); 
        if (!isDead) {
            this.context!.fillText(data.hp + "x\u{2764}", center, pseudo_y + 15);
            this.context!.fillText(data.ammo + "x\u{2022}", center, pseudo_y + 30);
        }
        this.context!.globalAlpha = 1;
        this.context!.fill();
        this.context!.closePath();
        this.context!.filter = "brightness(1) invert(0)";
    }

    public static renderBullet(x: number, y: number) {
        this.context!.fillStyle = "white";
        this.context!.beginPath();
        this.context!.rect(x, y, 8, 8);
        this.context!.fill();
        this.context!.closePath();
    }

    public static renderEnemy(x: number, y: number, boss: boolean, hp: number) {
        const img = getSkinImage(Skin.GREEN);
        this.drawSimpleImage(img, x, y, boss ? 2 : 1);
        if (boss) {
            const health_bar_y = y + (img.height * 2) + 15;
            const health_bar_width = img.width * 2;
            this.context!.beginPath();
            this.context!.fillStyle = "#f00";
            this.context!.fillRect(x, health_bar_y, health_bar_width, 10);
            this.context!.fillStyle = "#2ca614";
            this.context!.fillRect(x, health_bar_y, health_bar_width * (hp / 4), 10);
            this.context!.closePath();
        }
    }

    public static renderPowerup(p: PowerupData) {
        this.context!.globalAlpha = 0.7;
        this.drawSimpleImage(PowerupImages[p.type], p.x, p.y);
        this.context!.globalAlpha = 1;
    }

    private static drawSimpleImage(img: HTMLImageElement, x: number, y: number, scale = 1) {
        this.context!.beginPath();
        this.context!.drawImage(img, x, y, img.width * scale, img.height * scale);
        this.context!.fill();
        this.context!.closePath();
    }
}
