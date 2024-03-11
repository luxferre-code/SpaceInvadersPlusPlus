import type UI from "./ui/UI";
import type Ranking from "./models/Ranking";

declare global {
  interface Score {
    date: Date;
    score: number;
  }

  type Rankings = {
    player?: Ranking; // the current player's scores
    playerRank?: number; // the current player's rank
    first?: Ranking; // the first player worldwide
    second?: Ranking; // the second
    third?: Ranking; // the third
  }

  type RankingKey = keyof typeof UI.rankingTable.worldWideRecords;
}

export {};