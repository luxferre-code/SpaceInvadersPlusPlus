import Bullet from "./Bullet.js";

export default class Game {

    // Default limits for the game
    public static limits = {
        minX: 0,
        maxX: 800,
        minY: 0,
        maxY: 600
    };

    private static instance: Game;

    private constructor() {
        if(Game.instance == null) {
            Game.instance = this;
            console.log('Game initialized with success!');
        } else {
            throw new Error('Game is a singleton class. Use Game.getInstance() instead.');
        }
    }

    public static getInstance() {
        return Game.instance || new Game();
    }

    public addBullet(bullet: Bullet) : void {
        //TODO: implement this method
    }

}