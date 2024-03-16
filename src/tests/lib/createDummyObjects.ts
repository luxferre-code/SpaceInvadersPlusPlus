import Enemy from "../../Enemy";
import Player from "../../Player";
import Vector2 from "../../Vector2";

/**
 * Creates a dummy player for testing purposes.
 * @param canvas A dummy canvas used for the tests.
 * @param img A dummy image used for the skin of the player.
 */
export function createDummyPlayer(canvas: HTMLCanvasElement, img: HTMLImageElement): Player {
  return new Player(canvas, undefined, img);
}

/**
 * Creates a dummy enemy for testing purposes.
 * @param canvas A dummy canvas used for the tests.
 * @param img A dummy image used for the skin of the enemy.
 */
export function createDummyEnemy(canvas: HTMLCanvasElement, img: HTMLImageElement): Enemy {
  return new Enemy(canvas, new Vector2(), new Vector2(), img);
}