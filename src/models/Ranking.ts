/**
 * Describes the data to show in the ranking page.
 */
export default class {
  private name: string;
  private scores: Score[];

  /**
   * @param name The player's name.
   * @param scores The 10 highest sores the player has ever done.
   */
  constructor(name: string, scores: Score[]) {
    this.name = name;
    this.scores = [...scores].sort((a, b) => b.score - a.score); // creates a sorted copy of the argument
  }

  /**
   * Gets the player's name.
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Gets the highest score (as a number).
   */
  public getBestScore(): number {
    if (this.scores.length === 0) {
      return 0;
    }
    return this.scores[0].score;
  }

  public getScores(): Score[] {
    return this.scores;
  }
}