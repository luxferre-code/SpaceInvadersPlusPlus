/**
 * Gets the Difficulty property that corresponds to the given name.
 * @param level The level as a string.
 * @returns The difficulty level that corresponds.
 */
export function toDifficulty(level) {
    switch (level) {
        case "medium": return 2 /* Difficulty.MEDIUM */;
        case "hard": return 3 /* Difficulty.HARD */;
        case "custom": return 4 /* Difficulty.CUSTOM */;
        default:
            return 1 /* Difficulty.EASY */;
    }
}
