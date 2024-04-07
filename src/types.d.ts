import type { Skin } from "./utils/Skins";
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

    type Room = {
        id: string;
        game_started: boolean;
        players: {
            id: string;
            username: string;
            game_limits: GameLimits;
        }[]; // the room's manager is the first player
        computed_screen_limits: GameLimits; // maximums and minimums among all players' limits
    };

    type Vec2 = {
        x: number;
        y: number;
    }

    type ServerBullet = {
        shotByPlayer: boolean;
        x: number;
        y: number;
    };

    type PlayerData = {
        id: string;
        username: string;
        position: Vec2;
        skin: Skin;
        hp: number;
        immune: boolean;
    };

    type GameData = {
        enemies: Vec2[];
        bullets: ServerBullet[];
        players: PlayerData[];
        score: number;
        spawn_chance: number;
    }
}

export { };
