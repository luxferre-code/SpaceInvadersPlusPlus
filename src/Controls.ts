/**
 * An enum that holds the names of the key used for controlling the player's movements.
 * It's a constant enum, and as a consequence, TypeScript will take care of
 * replacing all occurrences of this enum by the value that is used.
 * In the final JavaScript output, this enum will vanish.
 */
export const enum Controls {
  UP = "ArrowUp",
  DOWN = "ArrowDown",
  LEFT = "ArrowLeft",
  RIGHT = "ArrowRight"
}