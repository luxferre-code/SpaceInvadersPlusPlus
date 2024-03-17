import { Difficulty } from "../utils/Difficulty";

// NOTE: the properties are all set to arbitrary values by default (-1).
// Their initial values do not matter.
// Don't bother changing them.

/**
 * Settings for a game.
 */
export default class {
  /**
   * The seed that the random number generator will
   * use for all the random actions of a game.
   */
  public static seed: number = -1;

  /**
   * The level of difficulty for a game.
   * This level defines presets for most settins,
   * unless the selected level is {@link Difficulty.CUSTOM}.
   */
  public static difficultyLevel: Difficulty = Difficulty.EASY;

  /**
   * The number of HP that the player has.
   * One HP is one heart.
   * One damage an integer and the HP get
   * reduced by a certain amount of damage.
   */
  public static playerHp: number = -1;

  /**
   * The minimum delay between two shots.
   */
  public static playerShootDelay: number = -1;

  /**
   * The ammunition the player starts with.
   */
  public static playerBasedAmmo: number = -1;

  /**
   * Resets the settings to fit presets that
   * depend on an arbirtary level of difficulty.
   * @param level The level of difficulty to base the presets on.
   */
  public static usePresets(level: Difficulty): void {
    if (level === Difficulty.CUSTOM) {
      return;
    }
    switch (level) {
      case Difficulty.HARD:
        this.playerHp = 1;
        this.playerBasedAmmo = 1;
        this.playerShootDelay = 300;
        break;
      case Difficulty.MEDIUM:
        this.playerHp = 3;
        this.playerBasedAmmo = 3;
        this.playerShootDelay = 300;
        break;
      default:
        // Difficulty.EASY
        this.playerHp = 5;
        this.playerBasedAmmo = 5;
        this.playerShootDelay = 300;
    }
  }
}