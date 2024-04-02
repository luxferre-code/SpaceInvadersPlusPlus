import HitBox from "./HitBox";
import IEntity from "./IEntity";
import PlayerServer from "./PlayerServer";
import Vector2 from "./Vector2";

export default class Enemy implements IEntity {
    isPlayer(): this is PlayerServer {
        throw new Error("Method not implemented.");
    }
    getPosition(): Vector2 {
        throw new Error("Method not implemented.");
    }
    generateHitBox(): HitBox {
        throw new Error("Method not implemented.");
    }
    render(): void {
        throw new Error("Method not implemented.");
    }
    move(): void {
        throw new Error("Method not implemented.");
    }
    isColliding(enemy: IEntity): boolean {
        throw new Error("Method not implemented.");
    }
    die(): void {
        throw new Error("Method not implemented.");
    }
}