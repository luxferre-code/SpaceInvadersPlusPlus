import Vector2 from "./Vector2";
import HitBox from "./HitBox";
import PlayerServer from "./PlayerServer";

export default interface IEntity {
    isPlayer() : this is PlayerServer;
    getPosition() : Vector2;
    generateHitBox() : HitBox;
    render() : void;
    move() : void;
    isColliding(enemy: IEntity): boolean;
}