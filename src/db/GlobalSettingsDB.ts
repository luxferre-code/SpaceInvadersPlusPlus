import { Skin, SkinMaximum, getSkinImage } from "../utils/Skins";

/**
 * Handles the player's settings.
 */
export default class {
    private static readonly LOCAL_STORAGE_KEY = "SpaceInvadersPlayerSettings";
    private static settings: PlayerSettings = this.fetchPlayerSettings() ?? this.useDefaultSettings();

    /**
     * Defines default settings for the player.
     * Those settings are saved into local storage.
     */
    private static useDefaultSettings(): PlayerSettings {
        const defaults = {
            effectsVolume: 50,
            musicVolume: 50,
            name: "Anonymous",
            skin: Skin.RED
        };
        this.saveSettings(defaults);
        return defaults;
    }

    /**
     * Fetches the player's settings from the LocalStorage.
     * @returns `undefined` if there is no settings stored in LocalStorage.
     */
    private static fetchPlayerSettings(): PlayerSettings | undefined {
        const value = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (value == null) {
            return;
        }
        const parsingResult = JSON.parse(value);
        if (this.checkValidity(parsingResult)) {
            return parsingResult;
        } else {
            this.resetPlayerSettings();
        }
    }

    /**
     * Checks the validity of the settings stored in the local storage.
     * @param parsingResult The parsed result from the local storage.
     * @returns `true` if it'ss valid player settings, `false` otherwise.
     */
    private static checkValidity(parsingResult: { [key: string]: any }): parsingResult is PlayerSettings {
        return "effectsVolume" in parsingResult &&
            "musicVolume" in parsingResult &&
            "name" in parsingResult &&
            "skin" in parsingResult &&
            parsingResult.musicVolume >= 0 && parsingResult.musicVolume <= 100 &&
            parsingResult.effectsVolume >= 0 && parsingResult.effectsVolume <= 100 &&
            parsingResult.name.length <= 20 &&
            parsingResult.skin >= 0 && parsingResult.skin <= SkinMaximum; // TODO: make sure it's a valid skin
    }

    /**
     * Save the settings into local storage.
     * @param specificSettings Specific settings that should be saved instead of `this.settings`.
     */
    private static saveSettings(specificSettings?: PlayerSettings) {
        specificSettings ??= this.settings;
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(specificSettings));
    }

    /**
     * Resets the player settings.
     */
    public static resetPlayerSettings() {
        this.settings = this.useDefaultSettings();
    }

    public static getSkinInformation(): FullSkinInformation {
        const skin = this.skin;
        const img = getSkinImage(skin);
        return {
            skin,
            sw: img.width,
            sh: img.height,
        };
    }

    public static get cloned(): PlayerSettings { return structuredClone(this.settings); }
    public static get name(): string { return this.settings.name; }
    public static get skin(): Skin { return this.settings.skin; }
    public static get musicVolume(): number { return this.settings.musicVolume; }
    public static get effectsVolume(): number { return this.settings.effectsVolume; }

    public static set name(newName: string) { this.settings.name = newName; this.saveSettings(); }
    public static set skin(newSkin: Skin) { this.settings.skin = newSkin; this.saveSettings(); }
    public static set musicVolume(newMusicVolume: number) { this.settings.musicVolume = newMusicVolume; this.saveSettings(); }
    public static set effectsVolume(newEffectsVolume: number) { this.settings.effectsVolume = newEffectsVolume; this.saveSettings(); }
}
