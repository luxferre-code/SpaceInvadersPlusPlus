import type RankingTable from "./ui/RankingPage";
import type Ranking from "./models/Ranking";

declare global {
  interface PlayerSettings {
    name: string;
    skin: number;
    musicVolume: number;
    effectsVolume: number;
  }

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

  // helper type to make iterating over the
  // properties of an object which has properties
  // named "first", "second" and "third" easier.
  type RankingKey = keyof typeof RankingTable.worldWideRecords;
}

export {};