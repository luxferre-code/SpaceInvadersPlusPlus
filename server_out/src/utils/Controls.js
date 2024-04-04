/**
 * An enum that holds the names of the key used for controlling the player's movements.
 */
export var Controls;
(function (Controls) {
    Controls["UP"] = "arrowup";
    Controls["DOWN"] = "arrowdown";
    Controls["LEFT"] = "arrowleft";
    Controls["RIGHT"] = "arrowright";
    Controls["SHOOT"] = "space";
})(Controls || (Controls = {}));
/**
 * Contains the values of the Controls enum.
 * The keys stored in this array are the keys allowed to be monitored.
 * The goal of this array is to improve performance, because without it
 * any key that gets pressed would be stored in the "controls" map of the Player.
 */
export const MOVEMENT_CONTROLS = [
    Controls.UP,
    Controls.RIGHT,
    Controls.DOWN,
    Controls.LEFT
];
