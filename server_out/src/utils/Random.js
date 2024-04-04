import seedrandom from "seedrandom";
export default class Random {
    _generator;
    constructor(seed) {
        this._generator = seedrandom(seed.toString());
    }
    /**
     * Gets a random number in [0; 1[
     */
    next() {
        return this._generator();
    }
    /**
     * Generates a random number in [min; max[
     * @param min - The minimum integer.
     * @param max - The maximum integer.
     * @returns An integer between min anx max.
     */
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min) + min);
    }
}
