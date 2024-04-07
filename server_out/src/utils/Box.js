export default class Box {
    top_left;
    top_right;
    bottom_left;
    bottom_right;
    constructor(x, y, width, height) {
        this.top_left = { x, y };
        this.top_right = { x: x + width, y };
        this.bottom_left = { x, y: y + height };
        this.bottom_right = { x: x + width, y: y + height };
    }
    isColliding(hitbox) {
        return this.top_left.x < hitbox.bottom_right.x &&
            this.bottom_right.x > hitbox.top_left.x &&
            this.top_left.y < hitbox.bottom_right.y &&
            this.bottom_right.y > hitbox.top_left.y;
    }
}
