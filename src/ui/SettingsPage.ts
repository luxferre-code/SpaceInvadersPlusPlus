/**
 * Handles the player's settings page in the modal.
 */
export default class {
  /**
   * The text input that allows modification of the player's pseudo.
   */
  public static readonly inputName = document.querySelector("#settings-name-input") as HTMLInputElement;

  /**
   * The choices of skins
   */
  public static readonly skinChoices = Array.from(document.querySelectorAll(".skin-choice")) as HTMLButtonElement[];

  /**
   * The reference to the currently selected skin.
   */
  private static currentSkinChoice: HTMLButtonElement | null = null;

  /**
   * The slider for the music volume.
   */
  public static readonly musicInput = document.querySelector("#music-input") as HTMLInputElement;

  /**
   * The slider for the audio effects volume.
   */
  public static readonly effectsInput = document.querySelector("#effects-input") as HTMLInputElement;

  /**
   * Initializes the settings with initial values.
   */
  public static initWith(initialSettings: PlayerSettings) {
    this.inputName.value = initialSettings.name;
    this.skinChoices[initialSettings.skin].classList.add("selected");
    this.currentSkinChoice = this.skinChoices[initialSettings.skin];
    this.musicInput.value = initialSettings.musicVolume.toString();
    this.effectsInput.value = initialSettings.effectsVolume.toString();
  }

  /**
   * Adds an event listener to whenever an audio slider change.
   * @param input The slider in the settings page.
   * @param callback The function to call whenever a change is made to the slider.
   */
  private static listenToAudioChange(input: HTMLInputElement, callback: (newVolume: number) => void) {
    input.addEventListener("change", () => {
      if (input.checkValidity()) {
        let newValue: number = 0;
        try {
          newValue = parseInt(input.value);
          if (Number.isNaN(newValue)) {
            throw new Error("");
          }
        } catch (_) {
          console.warn("Attempting to corrupt audio slider.");
        }
        callback(newValue);
      }
    });
  }

  /**
   * Adds an event listener that listens to whenever the music slider change.
   */
  public static listenToMusicVolumeChange(callback: (newVolume: number) => void) {
    this.listenToAudioChange(this.musicInput, callback);
  }

  /**
   * Adds an event listener that listens to whenever the audio effects slider change.
   */
  public static listenToEffectsVolumeChange(callback: (newVolume: number) => void) {
    this.listenToAudioChange(this.effectsInput, callback);
  }

  /**
   * Adds an event listener that listens to whenever the skin is changed.
   * The callback is not triggered if the player clicks
   * on the skin he has already selected.
   */
  public static listenToSkinChange(callback: (newSkin: number) => void) {
    for (let i = 0; i < this.skinChoices.length; i++) {
      this.skinChoices[i].addEventListener('click', (e) => {
        if (e.target && !(e.target as Element).isSameNode(this.currentSkinChoice)) {
          this.currentSkinChoice!.classList.remove("selected");
          this.currentSkinChoice = this.skinChoices[i];
          this.currentSkinChoice.classList.add("selected");
          callback(i);
        }
      });
    }
  }

  /**
   * Adds an event listener that listenes to
   * whenever the player's name is being edited.
   * @param callback The callback to call with the new name as parameter.
   */
  public static listenToNameChange(callback: (newName: string) => void) {
    this.inputName.addEventListener('input', () => {
      const newName = this.inputName.value.trim();
      if (newName.length <= 20) {
        callback(newName);
      }
    });
  }

  /**
   * Changes the value of the name's input in the settings.
   * It will not trigger a call to the callback (see {@link listenToNameChange}).
   * @param newName The new player's name.
   */
  public static forceChangePlayerName(newName: string) {
    this.inputName.value = newName;
  }
}