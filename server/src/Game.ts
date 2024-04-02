import Bullet from "./Bullet.js";
import IEntity from "./IEntity.js";

export default class Game {

    // Default limits for the game
    public static limits = {
        minX: 0,
        maxX: 800,
        minY: 0,
        maxY: 600
    };

    private _bullets: Bullet[] = [];
    private _entities: IEntity[] = [];
    private _owner: string;
    private _players: string[] = [];

    private static readonly _games: Game[] = [];

    private constructor(sockerId: string) {
        this._owner = sockerId;
        this._players.push(sockerId);
        if(Game.getInstance(sockerId) === undefined) {
            Game._games.push(this);
        } else {
            Game.remove(sockerId);
        }
    }

    public static new(sockerId: string) : Game {
        return new Game(sockerId);
    }

    public static remove(sockerId: string) : void {
        for (let i = 0; i < Game._games.length; i++) {
            if (Game._games[i]._owner === sockerId) {
                Game._games.splice(i, 1);
                return;
            }
        }
    }

    public static getInstance(sockerId: string) : Game {
        for (const game of Game._games) {
            if (game._owner === sockerId) {
                return game;
            }
        }
        return undefined;
    }

    public addBullet(bullet: Bullet) : void {
        this._bullets.push(bullet);
    }

    public addEntity(entity: IEntity) : void {
        this._entities.push(entity);
    }

}