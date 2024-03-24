export default class Random {
    private _seed: number;

    constructor(seed: number) {
        this._seed = seed;
    }

    public setSeed(newSeed: number) { this._seed = newSeed; }
    public getSeed(): number { return this._seed; }

    /**
     * Generates a random number in [min; max[
     * @param min - The minimum integer.
     * @param max - The maximum integer.
     * @returns An integer between min anx max.
     */
    public nextInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
