/**
 * An enum that holds the names of the key used for controlling the player's movements.
 */
export enum Controls {
  UP = "arrowup",
  DOWN = "arrowdown",
  LEFT = "arrowleft",
  RIGHT = "arrowright",
  SHOOT = "space"
}

/**
 * Contains the values of the Controls enum.
 * The keys stored in this array are the keys allowed to be monitored.
 * The goal of this array is to improve performance, because without it
 * any key that gets pressed would be stored in the "controls" map of the Player.
 */
export const ACCEPTABLE_CONTROLS: string[] = Object.values(Controls);
