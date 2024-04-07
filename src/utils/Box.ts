export default class Box {
    public readonly top_left: Vec2;
    public readonly top_right: Vec2;
    public readonly bottom_left: Vec2;
    public readonly bottom_right: Vec2;

    constructor(x: number, y: number, width: number, height: number) {
        this.top_left = { x, y };
        this.top_right =  { x: x + width, y };
        this.bottom_left = { x, y: y + height };
        this.bottom_right = { x: x + width, y: y + height };
    }

    public isColliding(hitbox: Readonly<Box>): boolean {
        return this.top_left.x < hitbox.bottom_right.x &&
            this.bottom_right.x > hitbox.top_left.x &&
            this.top_left.y < hitbox.bottom_right.y &&
            this.bottom_right.y > hitbox.top_left.y;
    }
}
