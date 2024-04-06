import { MOVEMENT_CONTROLS, Controls } from "./utils/Controls";
import { Skin } from "./utils/Skins";
import Sprite2D from "./Sprite2D";
import Vector2 from "./Vector2";
import GameSettings from "./models/GameSettings";
import GameClient from "./GameClient";

/**
 * This class represents the player entity in the game.
 */
export default class Player extends Sprite2D implements IEntity {
    private _hp: number = 5;

    /**
     * Whether or not the player is currently immuned to all sort of damage.
     * This is useful when the player got hit, and we don't want it to get
     * hit multiple times in a row (which would happen if two bullets overlapped).
     */
    private _immune: boolean = false;

    /**
     * For how long the player can stay immune to any damage
     * (see {@link _immune}).
     */
    private readonly IMMUNITY_DELAY = 500;

    /**
     * A callback to call when the player gets hit.
     * See {@link hurt}.
     */
    private on_player_hit_callback: null | ((hp: number) => void) = null;

    /**
     * This will register any key that is being pressed.
     * The key of this map is the name of the key, in lower case.
     */
    private controls: { [key: string]: boolean } = {};

    /**
     * Creates a new player and places it at the center of the screen
     * and a short distance away from the bottom.
     */
    constructor(skin = Skin.RED) {
        super(skin);
        this.initializeMovementControls();
    }

    /**
     * Places the player at a starting position depending on the width and height of its skin.
     * If for some reason the skin didn't load properly, it will spawn at a fallback position,
     * around the middle of the screen, near the bottom, but won't be properly aligned.
     */
    public placeAtStartingPosition() {
        if (this._skinImg) {
            this._position = new Vector2(GameClient.limits.maxX / 2 - this._skinImg.width, GameClient.limits.maxY - this._skinImg.height * 2);
        } else {
            this._position = new Vector2(GameClient.limits.maxX / 2, GameClient.limits.maxY - 100);
        }
    }

    /**
     * Sets the attributes of the player with the values defined in {@link GameSettings}.
     */
    public useLastGameSettings() {
        // this._hp = GameSettings.playerHp;
        // this._shootDelay = GameSettings.playerShootDelay;
    }

    /**
     * Renders the player, and increases the brightness of its skin
     * by a big amount when it is immuned (for clarity's sake).
     */
    public render(): void {
        if (this._immune) {
            GameClient.getContext().filter = "brightness(100)";
            super.render();
            GameClient.getContext().filter = "brightness(1)";
        } else {
            super.render();
        }
    }

    /**
     * Handles a key that is being pressed.
     * It checks if it's a control key (a key in the {@link Controls} enum).
     * If it is, it assigns the given `value` in {@link controls}.
     * @param e The keyboard event.
     * @param value The value to assign to {@link this.controls} if the key is a valid key.
     */
    private handleKeyPressed(e: KeyboardEvent, value: boolean) {
        const key = e.key.toLocaleLowerCase();
        if (e.code.toLowerCase() === Controls.SHOOT) {
            this.controls[Controls.SHOOT] = value;
        } else if (MOVEMENT_CONTROLS.includes(key)) {
            this.controls[key] = value;
        }
    }

    /**
     * Initializes the event listeners for controlling
     * the player's movement with the keyboard.
     */
    private initializeMovementControls(): void {
        window.addEventListener("keydown", e => this.handleKeyPressed(e, true));
        window.addEventListener("keyup", e => this.handleKeyPressed(e, false));
    }

    /**
     * Returns `true` if the player is temporarily immuned to all damage.
     */
    public isImmuned() {
        return this._immune;
    }

    /**
     * Method to decrease the player's HP
     * @returns true if the player is alive, false otherwise
     */
    public hurt(): boolean {
        if (!this._immune) {
            this._hp -= 1;
            this._immune = true;
            this.on_player_hit_callback?.(this._hp);
            setTimeout(() => {
                this._immune = false;
            }, this.IMMUNITY_DELAY);
        }
        return this._hp > 0;
    }

    /**
     * Defines a callback when the player gets hit.
     */
    public onPlayerHit(callback: (hp: number) => void) {
        this.on_player_hit_callback = callback;
    }

    /**
     * Gets the player's health points.
     */
    public getHealth(): number {
        return this._hp;
    }

    /**
     * Sets the health points of the player dynamically.
     */
    public setHealth(hp: number) {
        this._hp = hp;
    }
}
