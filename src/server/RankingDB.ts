import Ranking from "../models/Ranking";

export default class {
  /**
   * Creates fake scores.
   * REMOVE THIS when the database is implemented.
   */
  private static fakeDummyScores(): Score[] {
    const scores: Score[] = [];
    const numberOfScores = Math.floor((Math.random() * 11) + 1); // max is exclusive, min is 1
    for (let i = 0; i < numberOfScores; i++) {
      scores.push({
        score: Math.floor(Math.random() * 10000),
        date: new Date()
      });
    }
    return scores;
  }

  /**
   * Retrieves the best scores of the best players worldwide,
   * and the scores (and rank) of the current player.
   * If the current player is among the top 3, then the data will get repeated.
   * Note that there is not necessarily a top 3 at all, and if the player doesn't
   * have an account, then this function could return an empty object.
   */
  public static fetchRankingsAndScores(): Rankings {
    return {
      playerRank: 400,
      player: new Ranking("", this.fakeDummyScores()),
      first: new Ranking("FIRST", this.fakeDummyScores()),
      second: new Ranking("SECOND", this.fakeDummyScores()),
      third: new Ranking("THIRD", this.fakeDummyScores())
    };
  }
}