export const enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
  CUSTOM = 4
}

/**
 * Gets the Difficulty property that corresponds to the given name.
 * @param level The level as a string.
 * @returns The difficulty level that corresponds.
 */
export function toDifficulty(level: string): Difficulty {
  switch (level) {
    case "medium": return Difficulty.MEDIUM;
    case "hard": return Difficulty.HARD;
    case "custom": return Difficulty.CUSTOM;
    default:
      return Difficulty.EASY;
  }
}