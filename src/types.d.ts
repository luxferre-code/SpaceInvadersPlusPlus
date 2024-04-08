import type { Skin } from "./utils/Skins";
import type { Powerup } from "./utils/Powerups";
import type GameSettings from "./models/GameSettings";

declare global {
    type PlayerSettings = {
        name: string;
        skin: Skin;
        musicVolume: number;
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

    type Room = {
        id: string;
        game_started: boolean;
        players: {
            id: string;
            username: string;
            game_limits: GameLimits;
            skin: number;
            sw: number;
            sh: number;
        }[]; // the room's manager is the first player
        computed_screen_limits: GameLimits; // maximums and minimums among all players' limits
        all_powerups: FullSkinInformation[];
    };

    // The skin of the player,
    // along with the dimensions
    // of the skin (width and height).
    type FullSkinInformation = {
        skin: number;
        sw: number;
        sh: number;
    }

    type Vec2 = {
        x: number;
        y: number;
    }

    type ServerBullet = {
        shotByPlayer: boolean;
        x: number;
        y: number;
    }

    type PlayerData = {
        id: string;
        username: string;
        position: Vec2;
        hp: number;
        immune: boolean;
        sw: number; // all three are herited from the Room
        sh: number;
        skin: number;
        ammo: number;
    }

    type PowerupData = {
        x: number;
        y: number;
        type: Powerup;
    }

    type EnemyData = {
        x: number;
        y: number;
        boss: boolean;
        hp: number;
    }

    type GameData = {
        _physics_process: number | undefined;
        _process: number | undefined;
        enemies: EnemyData[];
        bullets: ServerBullet[];
        players: PlayerData[];
        powerups: PowerupData[];
        settings: GameSettings;
        score: number;
        spawn_chance: number;
        paused: boolean;
        paused_by: string | undefined;
        is_over: boolean;
        esw: number; // enemy skin width
        esh: number; // enemy skin height
        max_enemy_count: number; // the maximum number of enemies at the same time
    }
}

export { };
