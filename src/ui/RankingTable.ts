/**
 * Controls the last 10 highest scores of the player
 * that are shown in the ranking table (in the modal).
 * 
 * Do not use this class separately. It is meant to
 * be controlled by the Ui class only.
 */
export default class {
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
