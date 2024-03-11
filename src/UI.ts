/**
 * Controls the last 10 highest scores of the player
 * that are shown in the ranking table (in the modal).
 */
class RankingTable {
  /**
   * The personal highest score of the player.
   */
  public readonly personalScore = document.querySelector("#personal-score") as HTMLSpanElement;

  /**
   * The personal score button.
   * The goal of this button is to display the last 10 highest scores of the player.
   */
  public readonly personalScoreBtn = document.querySelector("#your-scores-btn") as HTMLButtonElement;

  /**
   * The rank of the current player.
   */
  public readonly personalRank = document.querySelector("#personal-rank") as HTMLSpanElement;

  /**
   * The arrow in the middle that plays the role of an indicator.
   * It's not displayed when the screen is too small for it.
   */
  public readonly arrow = document.querySelector("#ranking-middle-arrow") as HTMLImageElement;

  /**
   * The last 10 highest scores of a player.
   * This div contains two tables where 5 scores
   * are displayed in each of them.
   */
  public readonly last10ScoresTable = document.querySelector("#container-10-last-scores") as HTMLDivElement;

  /**
   * The label above the last 10 highest scores table.
   */
  public readonly last10ScoresLabel = document.querySelector("#last-scores-label") as HTMLParagraphElement;

  /**
   * A table for the three highest scores
   * of the entire game and their pseudos.
   */
  public readonly worldWideRecordsTable = document.querySelector("#worldwide-records-table") as HTMLTableElement;

  /**
   * The elements within {@link worldWideRecordsTable}
   */
  public readonly worldWideRecords = {
    first: {
      name: this.worldWideRecordsTable.querySelector("#records-first-player-btn") as HTMLButtonElement,
      highestScore: this.worldWideRecordsTable.querySelector("tr:nth-child(1) td:last-of-type") as HTMLTableCellElement
    },
    second: {
      name: this.worldWideRecordsTable.querySelector("#records-second-player-btn") as HTMLButtonElement,
      highestScore: this.worldWideRecordsTable.querySelector("tr:nth-child(2) td:last-of-type") as HTMLTableCellElement
    },
    third: {
      name: this.worldWideRecordsTable.querySelector("#records-third-player-btn") as HTMLButtonElement,
      highestScore: this.worldWideRecordsTable.querySelector("tr:last-of-type td:last-of-type") as HTMLTableCellElement
    },
  };

  /**
   * Removes all elements in {@link last10ScoresTable}
   */
  private removeLastScores() {
    while (this.last10ScoresTable.firstChild) {
      this.last10ScoresTable.removeChild(this.last10ScoresTable.firstChild);
    }
  }

  /**
   * Adds 5 scores (at most) to a table.
   * @param scores The 10 highest scores of a player (but not necessarily 10 elements).
   * @param beginIndex The starting index in `scores`.
   * @param table The table element being built.
   */
  private build5LastScores(scores: Score[], beginIndex: number): HTMLTableElement {
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    for (let i = beginIndex; i < 5 + beginIndex; i++) {
      const sc = scores.at(i);
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      const date = document.createElement("span");
      const highestScore = document.createElement("span");
      if (sc !== undefined) {
        highestScore.textContent = sc.score.toString();
        date.textContent = sc.date.toLocaleDateString();
      }
      td.appendChild(date)
      td.appendChild(highestScore);
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return table;
  }

  /**
   * Build the 10 highest scores in {@link last10ScoresTable}.
   * @param scores The 10 highest scores of a player.
   */
  public build10LastScores(scores: Score[]): void {
    this.removeLastScores();
    this.last10ScoresTable.appendChild(this.build5LastScores(scores, 0));
    this.last10ScoresTable.appendChild(this.build5LastScores(scores, 5));
  }

  /**
   * When the page is first loaded, the ranking table must
   * receive some information such as the name of the first player,
   * the scores of the current player, etc. This data is stored on the database
   * and retrieved as an object of type "Rankings" (which is a custom type).
   */
  public initWith(rankings: Rankings) {
    // First, initialize the event bindings.
    // Indeed, when the player clicks on the name
    // of the first record holder, then its 10 last
    // scores should be displayed.
    const keys = (["first", "second", "third"] as RankingKey[]);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.worldWideRecords[key].name.addEventListener('click', () => {
        if (rankings[key]) {
          this.build10LastScores(rankings[key]!.getScores());
          this.last10ScoresLabel.textContent = "Les 10 meilleurs scores du n°" + (i+1);
        }
      });
      // Initialize the name of the record holders,
      // and their actual score.
      this.worldWideRecords[key].name.textContent = rankings[key]?.getName() ?? "???";
      this.worldWideRecords[key].highestScore.textContent = rankings[key]?.getBestScore().toString() ?? "???";
    }
    this.personalScoreBtn.addEventListener('click', () => {
      this.build10LastScores(rankings.player?.getScores() ?? []);
      this.last10ScoresLabel.textContent = "Tes 10 meilleurs scores";
    });
    // Initialize the current player's info
    this.build10LastScores(rankings.player?.getScores() ?? []);
    this.personalScore.textContent = rankings.player?.getBestScore().toString() ?? "0";
    this.personalRank.textContent = rankings.playerRank?.toString() ?? "?";
  }
}

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
   * Since closing the modal takes time,
   * we need to make sure a modal cannot get
   * closed again or opened while it's closing.
   */
  private static isClosing = false;

  /**
   * This element contains the entire UI
   * except the <canvas> and the background's picture.
   */
  public static readonly ui: HTMLDivElement = document.querySelector("#ui") as HTMLDivElement;

  /**
   * This element contains the modal that is used
   * for the panels (ranking, settings, credits, etc.)
   */
  public static readonly modal: HTMLDialogElement = this.ui.querySelector("dialog") as HTMLDialogElement;

  /**
   * The time it takes for the modal to
   * be fully displayed or fully closed,
   * in milliseconds.
   */
  public static readonly modalTransitionDelay = parseFloat(getComputedStyle(this.modal).transitionDuration.split(", ")[0]) * 1000;

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
   * The modal contains multiple pages, but only one is displayed at a time.
   * This object holds these pages.
   * Select a page when showing the modal ({@link showModal}).
   */
  public static readonly modalPages = Object.freeze({
    credits: this.modal.querySelector("#credits-page") as HTMLDivElement,
    ranking: this.modal.querySelector("#ranking-page") as HTMLDivElement,
  });

  /**
   * The 10 highest scores of a player
   * in the ranking page of the modal.
   */
  public static readonly rankingTable = new RankingTable();

  /**
   * Shows an element while respecting ARIA recommendations.
   * @param element The element to show.
   */
  public static showElement(element: HTMLElement): void {
    element.setAttribute("aria-hidden", "false");
  }

  /**
   * Hides an element while respecting ARIA recommendations.
   * @param element The element to hide.
   */
  public static hideElement(element: HTMLElement): void {
    element.setAttribute("aria-hidden", "true");
  }

  /**
   * Checks if a given HTML element is hidden.
   * An hidden element has the attribute `aria-hidden`
   * that is set to `"true"`.
   * @param element The HTML element.
   * @returns `true` if the element is hidden, `false` otherwise.
   */
  public static isHidden(element: HTMLElement): boolean {
    return element.getAttribute("aria-hidden") === "true";
  }

  /**
   * Checks if a modal page is visible.
   */
  public static hasModalPageVisible(): boolean {
    return this.getVisibleModalPage() != undefined;
  }

  /**
   * Gets the current page displayed in the modal.
   */
  public static getVisibleModalPage(): HTMLElement | undefined {
    for (const page of Object.values(this.modalPages)) {
      if (!this.isHidden(page)) {
        return page;
      }
    }
    return undefined;
  }

  /**
   * Checks if the modal is open.
   */
  public static isModalOpen(): boolean {
    return this.modal.open && !this.isClosing;
  }

  /**
   * Handles the fact that when the user is clicking the backdrop
   * of the modal, then it closes itself automatically.
   * The "backdrop" is the "outside" of the dialog tag
   * (the dark overlay behind it).
   * @param e The event from "mousedown".
   */
  private static handleClosingModalWhenClickBackdrop(e: MouseEvent): void {
    if (e.target && "isSameNode" in e.target && (e.target as HTMLElement).isSameNode(this.modal)) {
      this.closeModal();
    }
  }

  /**
   * Hides the current page in the modal,
   * which is the only one not being hidden
   * among the elements in {@link modalPages}.
   */
  private static hideCurrentModalPage(): void {
    for (const page of Object.values(this.modalPages)) {
      if (!this.isHidden(page)) {
        this.hideElement(page);
        break;
      }
    }
  }

  /**
   * Waits for the modal's transition to finish
   * to hide the current modal's page.
   */
  private static closeModalWithDelay() {
    setTimeout(() => {
      this.isClosing = false;
      this.hideCurrentModalPage();
    }, this.modalTransitionDelay);
  }

  /**
   * Binds events that are directly related to the UI,
   * but it does not handle the interaction between the game
   * and the UI.
   */
  public static bindEvents(): void {
    if (!this.initialized) {
      this.mainButtons.credits.addEventListener('click', () => this.showModal(this.modalPages.credits));

      // Events related to the corner buttons
      this.cornerButtons.rankings.addEventListener('click', () => this.showModal(this.modalPages.ranking));

      // Events related to the modal
      this.modal.addEventListener('mousedown', this.handleClosingModalWhenClickBackdrop.bind(this));
      // The modal can be closed using the escape key
      // so we need to make sure we detect that
      // and trigger the right behavior.
      window.addEventListener("keydown", (e) => {
        if ((e.key === "Esc" || e.key === "Escape") && this.isModalOpen()) {
          this.isClosing = true;
          this.closeModalWithDelay();
        }
      });

      // Events related to the ranking table
      for (const key of ["first", "second", "third"]) {
        const btn = this.rankingTable.worldWideRecords[key as RankingKey].name;
        btn.addEventListener('click', () => this.moveArrowToElement(btn));
      }
      this.rankingTable.personalScoreBtn.addEventListener('click', () => this.moveArrowToElement(this.rankingTable.personalScoreBtn));

      this.initialized = true;
    }
  }

  public static showUI(): void { this.showElement(this.ui); }
  public static hideUI(): void { this.hideElement(this.ui); }

  /**
   * Opens the modal.
   * If it's already open, nothing will happen.
   * @param page The modal's page to hide.
   */
  public static showModal(page: HTMLElement): void {
    if (!this.isModalOpen()) {
      this.showElement(page);
      this.modal.showModal();
    }
  }

  /**
   * Closes the modal.
   * If it's not already open, nothing will happen.
   */
  public static closeModal(): void {
    if (this.isModalOpen()) {
      this.modal.close();
      this.isClosing = true;
      this.closeModalWithDelay();
    }
  }

  /**
   * Moves the arrow of the ranking page so that is's aligned
   * with the name of the player that has his scores currently
   * displayed in the table of the last 10 highest scores.
   */
  public static moveArrowToElement(element: HTMLElement) {
    const heightDifference = this.rankingTable.arrow.getBoundingClientRect().height / 4;
    const modalY = this.modal.getBoundingClientRect().y;
    const y = element.getBoundingClientRect().y;
    this.rankingTable.arrow.style.position = "absolute";
    this.rankingTable.arrow.style.top = (y - modalY - heightDifference) + "px";
  }
}