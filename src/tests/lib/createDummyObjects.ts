import { Skin } from "../../Skins";
import Vector2 from "../../Vector2";
import Player from "../../Player";
import Enemy from "../../Enemy";

/**
 * Creates a dummy player for testing purposes.
 * @param canvas A dummy canvas used for the tests.
 * @param img A dummy image used for the skin of the player.
 */
export function createDummyPlayer(canvas: HTMLCanvasElement, skin = Skin.RED): Player {
  return new Player(canvas, skin);
}

/**
 * Creates a dummy enemy for testing purposes.
 * @param canvas A dummy canvas used for the tests.
 * @param img A dummy image used for the skin of the enemy.
 */
export function createDummyEnemy(canvas: HTMLCanvasElement): Enemy {
  return new Enemy(canvas, new Vector2(), new Vector2());
}