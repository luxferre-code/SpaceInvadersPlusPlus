/**
 * Handles the User Interface.
 * 
 * It holds all the references to HTML elements in the page
 * in static readonly properties of frozen objects (to prevent unwanted modifications).
 * It provides helper functions that are meant to simplify our work
 * as well as making sure everything is done consistently.
 * 
 * Note that it doesn't handle interactions between a game and the HUD,
 * but only the interactions in the user interface (like the main menu,
 * the ranking, the credits, etc.).
 * 
 * Basically, it just shows or hides UI elements when buttons are clicked.
 */
export default class {
  /**
   * Whether or not the buttons of the UI
   * received their event listeners.
   */
  private static initialized = false;

  /**
   * This element contains the entire UI
   * except the <canvas> and the background's picture.
   */
  public static readonly ui: HTMLDivElement = document.querySelector("#ui") as HTMLDivElement;

  /**
   * Contains the three main buttons of the game (such as "Play now" etc.).
   * Control them to start a new game, or open the credits.
   */
  public static readonly mainButtons = Object.freeze({
    playNow: document.querySelector("#playNow") as HTMLButtonElement,
    playCoop: document.querySelector("#playCoop") as HTMLButtonElement,
    credits: document.querySelector("#openCredits") as HTMLButtonElement
  });

  /**
   * Contains the buttons at the top right corner of the screen.
   * It the button to show the ranking and the player's settings.
   */
  public static readonly cornerButtons = Object.freeze({
    rankings: document.querySelector("#openRankings") as HTMLButtonElement,
    playerSettings: document.querySelector("#openPlayerSettings") as HTMLButtonElement,
  });

  /**
   * Shows an element while respecting ARIA recommendations.
   * @param element The element to show.
   */
  public static showElement(element: HTMLElement) {
    element.setAttribute("aria-hidden", "false");
  }

  /**
   * Hides an element while respecting ARIA recommendations.
   * @param element The element to hide.
   */
  public static hideElement(element: HTMLElement) {
    element.setAttribute("aria-hidden", "true");
  }

  /**
   * Binds events that are directly related to the UI,
   * but it does not handle the interaction between the game
   * and the UI.
   */
  public static bindEvents() {
    if (!this.initialized) {
      this.mainButtons.playNow.addEventListener('click', () => {
        this.hideUI();
      });
      this.initialized = true;
    }
  }

  public static showUI() { this.showElement(this.ui); }
  public static hideUI() { this.hideElement(this.ui); }
}