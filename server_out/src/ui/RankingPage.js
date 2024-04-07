/**
 * Controls the last 10 highest scores of the player
 * that are shown in the ranking table (in the modal).
 *
 * Do not use this class separately. It is meant to
 * be controlled by the Ui class only.
 */
export default class default_1 {
    /**
     * The personal highest score of the player.
     */
    static personalScore = document.querySelector("#personal-score");
    /**
     * The personal score button.
     * The goal of this button is to display the last 10 highest scores of the player.
     */
    static personalScoreBtn = document.querySelector("#your-scores-btn");
    /**
     * The rank of the current player.
     */
    static personalRank = document.querySelector("#personal-rank");
    /**
     * The arrow in the middle that plays the role of an indicator.
     * It's not displayed when the screen is too small for it.
     */
    static arrow = document.querySelector("#ranking-middle-arrow");
    /**
     * The last 10 highest scores of a player.
     * This div contains two tables where 5 scores
     * are displayed in each of them.
     */
    static last10ScoresTable = document.querySelector("#container-10-last-scores");
    /**
     * The label above the last 10 highest scores table.
     */
    static last10ScoresLabel = document.querySelector("#last-scores-label");
    /**
     * A table for the three highest scores
     * of the entire game and their pseudos.
     */
    static worldWideRecordsTable = document.querySelector("#worldwide-records-table");
    /**
     * The elements within {@link worldWideRecordsTable}
     */
    static worldWideRecords = {
        first: {
            name: this.worldWideRecordsTable.querySelector("#records-first-player-btn"),
            highestScore: this.worldWideRecordsTable.querySelector("tr:nth-child(1) td:last-of-type")
        },
        second: {
            name: this.worldWideRecordsTable.querySelector("#records-second-player-btn"),
            highestScore: this.worldWideRecordsTable.querySelector("tr:nth-child(2) td:last-of-type")
        },
        third: {
            name: this.worldWideRecordsTable.querySelector("#records-third-player-btn"),
            highestScore: this.worldWideRecordsTable.querySelector("tr:last-of-type td:last-of-type")
        },
    };
    /**
     * Removes all elements in {@link last10ScoresTable}
     */
    static removeLastScores() {
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
    static build5LastScores(scores, beginIndex) {
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
            td.appendChild(date);
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
    static build10LastScores(scores) {
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
    static initWith(rankings) {
        // First, initialize the event bindings.
        // Indeed, when the player clicks on the name
        // of the first record holder, then its 10 last
        // scores should be displayed.
        const keys = ["first", "second", "third"];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.worldWideRecords[key].name.addEventListener('click', () => {
                if (rankings[key]) {
                    this.build10LastScores(rankings[key].getScores());
                    this.last10ScoresLabel.textContent = "Les 10 meilleurs scores du n°" + (i + 1);
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
    /**
     * Checks if the middle arrow is hidden.
     * It gets hidden by media queries.
     */
    static isArrowHidden() {
        return getComputedStyle(this.arrow.parentElement).display === "none";
    }
}
