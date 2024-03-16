import Vector2 from "./Vector2";

export default class HitBox {
    public top_left: Vector2;
    public top_right: Vector2;
    public bottom_left: Vector2;
    public bottom_right: Vector2;

    constructor(position: Vector2, image: HTMLImageElement) {
        this.top_left = new Vector2(position.x, position.y);
        this.top_right = new Vector2(position.x + image.width, position.y);
        this.bottom_left = new Vector2(position.x, position.y + image.height);
        this.bottom_right = new Vector2(position.x + image.width, position.y + image.height);
    }
}