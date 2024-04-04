/**
 * Describes the data to show in the ranking page.
 */
export default class {
    name;
    scores;
    /**
     * @param name The player's name.
     * @param scores The 10 highest sores the player has ever done.
     */
    constructor(name, scores) {
        this.name = name;
        this.scores = [...scores].sort((a, b) => b.score - a.score); // creates a sorted copy of the argument
    }
    /**
     * Gets the player's name.
     */
    getName() {
        return this.name;
    }
    /**
     * Gets the highest score (as a number).
     */
    getBestScore() {
        if (this.scores.length === 0) {
            return 0;
        }
        return this.scores[0].score;
    }
    getScores() {
        return this.scores;
    }
}
