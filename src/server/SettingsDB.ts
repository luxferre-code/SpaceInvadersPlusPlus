/**
 * Handles the player's settings.
 */
export default class {
  private static settings: PlayerSettings = this.getDefaultSettings();

  private static getDefaultSettings(): PlayerSettings {
    return {
      effectsVolume: 50,
      musicVolume: 50,
      name: "Anonymous",
      skin: 0
    };
  }

  /**
   * Fetches the player's settings from the LocalStorage.
   */
  public static fetchPlayerSettings(): void {
    // this.settings = {
    //   effectsVolume: 20,
    //   musicVolume: 10,
    //   name: "ItsMyName",
    //   skin: 0
    // };
  }

  public static get cloned(): PlayerSettings { return structuredClone(this.settings); }
  public static get name(): string { return this.settings.name; }
  public static get skin(): number { return this.settings.skin; }
  public static get musicVolume(): number { return this.settings.musicVolume; }
  public static get effectsVolume(): number { return this.settings.effectsVolume; }

  public static set name(newName: string) { this.settings.name = newName; }
}