import { Difficulty, toDifficulty } from "../utils/Difficulty";
import GameSettings from "../models/GameSettings";

/**
 * Handles the logic behind the page that
 * displays the settings of a new game.
 */
export default class GameSettingsPage {
    private static init = false;

    private static readonly playNowBtn = document.querySelector("#confirm-game-settings") as HTMLButtonElement;
    private static readonly playNowText = this.playNowBtn.querySelector("span") as HTMLSpanElement;
    private static readonly difficultyLevelSelect = document.querySelector("#game-level") as HTMLSelectElement;
    private static readonly gamePlayerHpInput = document.querySelector("#game-player-hp") as HTMLInputElement;
    private static readonly gamePlayerBasedAmmoInput = document.querySelector("#game-player-based-ammo") as HTMLInputElement;
    private static readonly gamePlayerShootDelayInput = document.querySelector("#game-shoot-delay") as HTMLInputElement;

    /**
     * The inputs that can only be edited when the difficulty is set to {@link Difficulty.CUSTOM}.
     */
    private static readonly customizableInputs = Array.from(document.querySelectorAll("#game-settings-page input:disabled")) as HTMLInputElement[];

    private static on_game_started_overload: (() => void) | undefined = undefined;

    public static settings = new GameSettings();

    /**
     * Defines a callback to execute when the player
     * clicks on the button to start the game.
     */
    public static onGameStarted(callback: () => void) {
        this.playNowBtn.addEventListener('click', () => {
            if (this.on_game_started_overload) {
                this.on_game_started_overload();
                this.on_game_started_overload = undefined;
            } else {
                callback();
            }
        });
    }

    public static setPlayButtonText(text: string) {
        this.playNowText.textContent = text;
    }

    public static overridePlayButtonCallback(overload: () => void) {
        this.on_game_started_overload = overload;
    }

    public static focusDifficulty() {
        this.difficultyLevelSelect.focus();
    }

    /**
     * Initializes the event listeners of the Settings page
     * (the settings specific to a game, like the seed, etc.).
     */
    public static initDefaultGameSettings(): void {
        if (this.init) {
            return;
        }

        // Make sure the inputs display their default values.
        this.displayGameSettingsValues();

        this.difficultyLevelSelect.addEventListener('change', (e) => {
            if (e.target) {
                const level = (e.target as HTMLSelectElement).value.toLocaleLowerCase();
                const difficulty = toDifficulty(level);
                if (difficulty === Difficulty.CUSTOM) {
                    this.enableInputs();
                } else {
                    this.settings.usePresets(difficulty);
                    this.displayGameSettingsValues();
                    this.disableInputs();
                }
                this.settings.difficultyLevel = difficulty;
            }
        });

        this.handleNumberInputForSetting("playerHp", this.gamePlayerHpInput);
        this.handleNumberInputForSetting("playerShootDelay", this.gamePlayerShootDelayInput);
        this.handleNumberInputForSetting("playerBasedAmmo", this.gamePlayerBasedAmmoInput);

        this.init = true;
    }

    /**
     * Changes the inputs in order to sync what they display 
     * and the actual values in the GameSettings class.
     */
    private static displayGameSettingsValues() {
        this.setInput(this.gamePlayerHpInput, "playerHp");
        this.setInput(this.gamePlayerBasedAmmoInput, "playerBasedAmmo");
        this.setInput(this.gamePlayerShootDelayInput, "playerShootDelay");
    }

    /**
     * Disable inputs for values that can only be changed
     * when the difficulty level is set to {@link Difficulty.CUSTOM}.
     */
    private static disableInputs() {
        for (const input of this.customizableInputs) {
            this.disableInput(input);
        }
    }

    /**
     * Enables inputs for values that can only be changed
     * when the difficulty level is set to {@link Difficulty.CUSTOM}.
     */
    private static enableInputs() {
        for (const input of this.customizableInputs) {
            this.enableInput(input);
        }
    }

    /**
     * Disables a particular input.
     */
    private static disableInput(input: HTMLInputElement) {
        input.setAttribute("disabled", "disabled");
    }

    /**
     * Removes the "disabled" attribute from an input.
     */
    private static enableInput(input: HTMLInputElement) {
        input.removeAttribute("disabled");
    }

    /**
     * Sets an input's value with the corresponding value from the {@link GameSettings} class.
     * @param input The reference to a customisable input (one in {@link customizableInputs}).
     * @param setting The name of a property in the {@link GameSettings} class that match the input.
     */
    private static setInput(input: HTMLInputElement, setting: Readonly<keyof GameSettings>) {
        input.value = this.settings[setting].toString();
    }

    /**
     * Handles the change of the value of an input of type "number"
     * and saves the new value into the GameSettings object.
     * @param setting The name of a property in the GameSettings class.
     * @param input The instance of the input that should be listened to.
     */
    private static handleNumberInputForSetting(setting: keyof GameSettings, input: HTMLInputElement) {
        input.addEventListener('blur', (e) => {
            const target = e.target as HTMLInputElement;
            const value = parseInt(target.value);
            const min = parseInt(target.getAttribute("min")!);
            const max = parseInt(target.getAttribute("max")!);
            if (value < min) {
                target.value = min.toString();
            } else if (value > max) {
                target.value = max.toString();
            }
            this.settings[setting] = parseInt(target.value) as any;
        });
    }
}
