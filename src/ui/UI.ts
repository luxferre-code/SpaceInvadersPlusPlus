import LobbyPage from "./LobbyPage";
import RankingTable from "./RankingPage";

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
        settings: this.modal.querySelector("#settings-page") as HTMLDivElement,
        gameSettings: this.modal.querySelector("#game-settings-page") as HTMLDivElement,
        lobby: this.modal.querySelector("#lobby-page") as HTMLDivElement,
    });

    /**
     * The black rectangles at the left & right of the screezn
     * that appear when a game is being played.
     */
    public static readonly gameBorders = Object.freeze({
        left: document.querySelector("#game-left-border") as HTMLElement,
        right: document.querySelector("#game-right-border") as HTMLElement,
    });

    /**
     * The paragraph element that contains the text for telling the user its score during a game.
     */
    public static readonly containerScore = document.querySelector("#container-score") as HTMLElement;

    /**
     * The actual element span that holds the score.
     */
    public static readonly scoreElement = this.containerScore.querySelector("#score") as HTMLElement;

    /**
     * The death screen. Show it when the player is dead,
     * and hide it when a game is restarted.
     */
    public static readonly deathScreen = document.querySelector("#death-screen") as HTMLElement;

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
            this.mainButtons.playNow.addEventListener('click', () => this.showModal(this.modalPages.gameSettings));
            this.mainButtons.credits.addEventListener('click', () => this.showModal(this.modalPages.credits));
            this.mainButtons.playCoop.addEventListener('click', () => {
                LobbyPage.requestRooms();
                this.showModal(this.modalPages.lobby);
            });

            // Events related to the corner buttons
            this.cornerButtons.rankings.addEventListener('click', () => this.showModal(this.modalPages.ranking));
            this.cornerButtons.playerSettings.addEventListener('click', () => this.showModal(this.modalPages.settings));

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
                const btn = RankingTable.worldWideRecords[key as RankingKey].name;
                btn.addEventListener('click', () => this.moveArrowToElement(btn));
            }
            RankingTable.personalScoreBtn.addEventListener('click', () => this.moveArrowToElement(RankingTable.personalScoreBtn));

            this.initialized = true;
        }
    }

    /**
     * Shows the UI, makes it interactive
     * and hides the score.
     */
    public static showUI(): void {
        this.ui.removeAttribute("inert");
        this.showElement(this.ui);
        this.hideElement(this.containerScore);
        this.hideElement(this.gameBorders.left);
        this.hideElement(this.gameBorders.right);
        // Focus the main button (Play now)
        this.mainButtons.playNow.focus();
    }

    /**
     * Hides the UI,
     * closed the modal,
     * blurs the active element.
     * The goal of this function is to hide
     * the menus etc. when the game starts.
     */
    public static hideUI(): void {
        // The "inert" HTML attribute hides the element
        // and its childen from assistive technologies.
        // Therefore, pressing "Tab" won't raise focus
        // on hidden elements of the UI thanks to this.
        // More info here: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert
        this.ui.setAttribute("inert", "inert");
        this.hideElement(this.ui);
        this.showElement(this.gameBorders.left);
        this.showElement(this.gameBorders.right);
        this.showElement(this.containerScore);
        this.closeModal();
        const focusedElement = this.getFocusedElement();
        if (focusedElement) {
            focusedElement.blur();
        }
    }

    /**
     * Gets the element that has focus.
     * If there is no focused element, it returns `null`.
     */
    private static getFocusedElement(): HTMLElement | null {
        return (document.activeElement as HTMLElement) || document.querySelector(":focus");
    }

    /**
     * Changes the score.
     * @param score The new score.
     */
    public static setScore(score: number) {
        this.scoreElement.textContent = score.toString();
    }
    
    public static showDeathScreen() {
        this.showElement(this.deathScreen);
    }

    public static hideDeathScreen() {
        this.hideElement(this.deathScreen);
    }

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
        if (RankingTable.isArrowHidden()) {
            return;
        }
        const heightDifference = RankingTable.arrow.getBoundingClientRect().height / 4;
        const modalY = this.modal.getBoundingClientRect().y;
        const y = element.getBoundingClientRect().y;
        RankingTable.arrow.style.position = "absolute";
        RankingTable.arrow.style.top = (y - modalY - heightDifference) + "px";
    }
}
