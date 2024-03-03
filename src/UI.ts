export default class {
  /**
   * Whether or not the buttons of the UI
   * received their event listeners.
   */
  private static initialize = false;

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

  public static bindEvents() {
    if (!this.initialize) {
      this.mainButtons.playNow.addEventListener('click', () => {
        this.hideUI();
      });
    }
  }

  public static showUI() { this.showElement(this.ui); }
  public static hideUI() { this.hideElement(this.ui); }
}