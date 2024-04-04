import Vector2 from "../Vector2";
export default class HitBox {
    top_left;
    top_right;
    bottom_left;
    bottom_right;
    constructor(position, width, height) {
        this.top_left = new Vector2(position.x, position.y);
        this.top_right = new Vector2(position.x + width, position.y);
        this.bottom_left = new Vector2(position.x, position.y + height);
        this.bottom_right = new Vector2(position.x + width, position.y + height);
    }
    isColliding(hitbox) {
        return this.top_left.x < hitbox.bottom_right.x &&
            this.bottom_right.x > hitbox.top_left.x &&
            this.top_left.y < hitbox.bottom_right.y &&
            this.bottom_right.y > hitbox.top_left.y;
    }
}
