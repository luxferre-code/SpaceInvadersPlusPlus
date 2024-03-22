import { describe, test, expect } from "vitest";
import { createFakeCanvas } from "./lib/createHTMLElement";
import { createDummyEnemy } from "./lib/createDummyEntties";
import Enemy from "../Enemy";

describe('Tests for Enemy class', () => {
    const canvas = createFakeCanvas();

    test('should genere a random position', () => {
        const vector = Enemy.generateRandomXPosition();
        expect(vector.x).toBeGreaterThanOrEqual(0);
        expect(vector.x).toBeLessThanOrEqual(canvas.width);
        expect(vector.x).toBeLessThanOrEqual(canvas.height);
        expect(vector.y).toEqual(0);
    });

    test('should kill a enemy', () => {
        const enemy = createDummyEnemy(canvas);
        expect(enemy.die()).toBeTruthy();
        expect(enemy.isDead()).toBeTruthy();
    });
});
