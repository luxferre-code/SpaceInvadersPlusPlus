import Vector2 from "./Vector2.js";
import HitBox from "./HitBox.js";
import PlayerServer from "./PlayerServer.js";

export default interface IEntity {
    isPlayer() : this is PlayerServer;
    getPosition() : Vector2;
    generateHitBox() : HitBox;
    render() : void;
    move() : void;
    isColliding(enemy: IEntity): boolean;
}