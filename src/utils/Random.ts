import seedrandom from "seedrandom";

export default class Random {
    private _generator: seedrandom.PRNG;

    constructor(seed: number) {
        this._generator = seedrandom(seed.toString());
    }

    /**
     * Gets a random number in [0; 1[
     */
    public next(): number {
        return this._generator();
    }

    /**
     * Generates a random number in [min; max[
     * @param min - The minimum integer.
     * @param max - The maximum integer.
     * @returns An integer between min anx max.
     */
    public nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min) + min);
    }
}
