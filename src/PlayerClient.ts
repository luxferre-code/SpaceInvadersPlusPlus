import type { Socket } from "socket.io-client";
import { Controls, MOVEMENT_CONTROLS } from "./utils/Controls";
import { getSkinImage } from "./utils/Skins";
import GameClient from "./GameClient";

export default class PlayerClient {
    /**
     * The client socket of the player.
     */
    private static socket: Socket;

    /**
     * It describes by how many pixels pressing a control key moves the player on each frame.
     * The higher this value, the higher the player's acceleration towards {@link MAX_VELOCITY}.
     */
    private static readonly MOVEMENT_STRENGTH = 0.8;

    /**
     * The coefficient that is applied to a movement (either {@link mX} or {@link mY})
     * that is meant to make the player bounce against a wall.
     * 
     * A value too high won't change a thing since the movements are limited to {@link MAX_VELOCITY}.
     * Note that it must be NEGATIVE.
     */
    private static readonly REPULSIVE_STRENGTH = -2;

    /**
     * The maximum amount of pixels the player is allowed to move on every frame.
     * This describes the maximum value that the movement variables
     * ({@link mX} and {@link mY}) can reach.
     * 
     * Note that this max velocity isn't necessarily reached.
     * The maximum speed of the player can exceed it by the amount described by {@link MOVEMENT_STRENGTH}.
     */
    private static readonly MAX_VELOCITY = 5;

    /**
     * Describes the player's current movement on the X-axis.
     * A value of 0 means the player isn't moving horizontally.
     */
    private static mX = 0;

    /**
     * Describes the player's current movement on the Y-axis.
     * A value of 0 means the player isn't moving vertically.
     */
    private static mY = 0;

    /**
     * This will register any key that is being pressed.
     * The key of this map is the name of the key, in lower case.
     */
    private static controls: { [key: string]: boolean } = {};

    /**
     * Whether or not the player is allowed to shoot.
     * A player must wait {@link SHOOT_DELAY} ms before shooting again.
     */
    private static can_shoot = true;

    /**
     * The player's current position.
     */
    private static player_position = { x: 0, y: 0 };

    /**
     * The HTML element of the player's skin.
     */
    private static player_skin_img: HTMLImageElement | null = null;

    /**
     * The delay in milliseconds between two shots.
     * It can be customised in the game settings.
     * Defaults to 500ms.
     */
    private static shoot_delay: number = 500;

    /**
     * Defines the player's metadata such as its skin, username, initial position, etc.
     */
    public static setPlayerData(player_data: Readonly<PlayerData>, shoot_delay: number) {
        this.player_position = player_data.position;
        this.player_skin_img = getSkinImage(player_data.skin);
        this.shoot_delay = shoot_delay;
        this.resetControls();
    }

    public static resetControls() {
        this.controls = {};
    }

    /**
     * Gets the player's current position.
     */
    public static getPosition(): { x: number, y: number } {
        return this.player_position;
    }

    /**
     * Gets the player's skin width, or 0 if it's not defined;
     */
    private static getSkinWidth(): number {
        return this.player_skin_img?.width ?? 0;
    }

    /**
     * Gets the player's skin height, or 0 if it's not defined;
     */
    private static getSkinHeight(): number {
        return this.player_skin_img?.height ?? 0;
    }

    /**
     * Initializes the event handlers for the player's movements.
     */
    public static initConnection(socket: Socket) {
        this.socket = socket;
        window.addEventListener("keydown", e => this.handleKeyPressed(e, true));
        window.addEventListener("keyup", e => this.handleKeyPressed(e, false));
    }

    /**
     * Depending on what keys are currently being pressed,
     * this function will increment or decrement the movement
     * variables accordingly (see {@link mX} and {@link mY}).
     */
    private static handleMovementControls() {
        if (this.controls[Controls.UP]) this.mY -= this.MOVEMENT_STRENGTH;
        if (this.controls[Controls.RIGHT]) this.mX += this.MOVEMENT_STRENGTH;
        if (this.controls[Controls.DOWN]) this.mY += this.MOVEMENT_STRENGTH;
        if (this.controls[Controls.LEFT]) this.mX -= this.MOVEMENT_STRENGTH;
        if (this.controls[Controls.SHOOT]) this.shoot();
    }

    /**
     * Handles a key that is being pressed.
     * It checks if it's a control key (a key in the {@link Controls} enum).
     * If it is, it assigns the given `value` in {@link controls}.
     */
    private static handleKeyPressed(e: KeyboardEvent, value: boolean) {
        const key = e.key.toLocaleLowerCase();
        if (e.code.toLowerCase() === Controls.SHOOT) {
            this.controls[Controls.SHOOT] = value;
        } else if (MOVEMENT_CONTROLS.includes(key)) {
            this.controls[key] = value;
        }
    }

    /**
     * Returns `true` if the player's future horizontal
     * position exceeds the limits of the screen
     * @param nextX The next value of {@link mX}.
     */
    private static isXOutOfBounds(nextX: number) {
        return nextX <= GameClient.limits.minX || nextX + this.getSkinWidth() >= GameClient.limits.maxX;
    }

    /**
     * Returns `true` if the player's future vertical
     * position exceeds the limits of the screen
     * @param nextY The next value of {@link mY}.
     */
    private static isYOutOfBounds(nextY: number) {
        return nextY <= GameClient.limits.minY || nextY + this.getSkinHeight() >= GameClient.limits.maxY;
    }

    /**
     * Moves the player.
     * Call this method on every frame.
     */
    public static move() {
        this.mX *= 0.95; // the movement on the X-axis get reduced by 5% on every frame
        this.mY *= 0.95; // the movement on the y-axis get reduced by 5% on every frame

        // By default, if we keep reducing by 5%
        // then the movements will never reach 0.
        // That's annoying because we get very quickly to
        // numbers such as 5e-20 (which are irrelevant movements).
        // To avoid this, if the distance to 0 is below a threshold,
        // then it gets set to 0 manually.
        // It's not a problem when starting the movement,
        // as long as the threshold is less than `MOVEMENT_STRENGTH`.
        if (Math.abs(this.mX) < 0.005) this.mX = 0;
        if (Math.abs(this.mY) < 0.005) this.mY = 0;

        // Here, we make sure that the velocity doesn't exceed `MAX_VELOCITY`.
        // This check works for both negative and positive numbers.
        // Note that "Math.sign" returns -1 for a negative number, or 1 for positive.
        if (Math.abs(this.mX) > this.MAX_VELOCITY) this.mX = Math.sign(this.mX) * this.MAX_VELOCITY;
        if (Math.abs(this.mY) > this.MAX_VELOCITY) this.mY = Math.sign(this.mY) * this.MAX_VELOCITY;

        // This will check on every frame if keys are pressed,
        // and increment the speed accordingly by a constant amount.
        this.handleMovementControls();

        // This makes sure that the player doesn't get out of the canvas.
        const nextX = this.player_position.x + this.mX;
        const nextY = this.player_position.y + this.mY;

        if (!this.isXOutOfBounds(nextX)) {
            this.player_position.x += this.mX;
        } else {
            // The player reached an horizontal border of the screen.
            // Apply a repulsive force to keep it away.
            this.mX *= this.REPULSIVE_STRENGTH;
        }

        if (!this.isYOutOfBounds(nextY)) {
            this.player_position.y += this.mY;
        } else {
            // The player reached a vertical border of the screen.
            // Apply a repulsive force to keep it away.
            this.mY *= this.REPULSIVE_STRENGTH;
        }
    }

    /**
     * If the player can shoot (see {@link can_shoot}),
     * then emit a signal to the server and start {@link SHOOT_DELAY}.
     */
    private static shoot() {
        if (this.can_shoot) {
            this.socket.emit("game_player_shooting");
            this.can_shoot = false;
            setTimeout(() => {
                this.can_shoot = true;
            }, this.shoot_delay);
        }
    }
}
