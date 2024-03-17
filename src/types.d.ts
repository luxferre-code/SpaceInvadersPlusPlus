import type { Skin } from "./Skins";
import type RankingTable from "./ui/RankingPage";
import type Ranking from "./models/Ranking";

declare global {
  type PlayerSettings = {
    name: string;
    skin: Skin;
    musicVolume: number;
    effectsVolume: number;
  }

  type GameSettingsInterface = {
    seed: number;
    playerHp: number;
    playerBasedAmmo: number;
  }

  type Score = {
    date: Date;
    score: number;
  }

  type GameLimits = {
    maxY: number;
    maxX: number;
    minX: number;
    minY: number;
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