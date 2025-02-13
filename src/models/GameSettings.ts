import { Difficulty } from "../utils/Difficulty";

// NOTE: the properties are all set to arbitrary values by default (-1).
// Their initial values do not matter.
// Don't bother changing them.

/**
 * Settings for a game.
 */
export default class GameSettings {
    /**
     * The level of difficulty for a game.
     * This level defines presets for most settins,
     * unless the selected level is {@link Difficulty.CUSTOM}.
     */
    public difficultyLevel: Difficulty = Difficulty.EASY;

    /**
     * The number of HP that the player has.
     * One damage an integer and the HP get
     * reduced by a certain amount of damage.
     */
    public playerHp: number = -1;

    /**
     * The minimum delay between two shots.
     */
    public playerShootDelay: number = -1;

    /**
     * The ammunition the player starts with.
     */
    public playerBasedAmmo: number = -1;

    constructor() {
        this.usePresets(Difficulty.EASY);
    }

    /**
     * Resets the settings to fit presets that
     * depend on an arbirtary level of difficulty.
     * @param level The level of difficulty to base the presets on.
     */
    public usePresets(level: Difficulty): void {
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
