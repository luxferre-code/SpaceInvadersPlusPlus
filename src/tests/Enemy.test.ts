import { describe, test, expect } from "vitest";
import { createFakeCanvas } from "./lib/createHTMLElement";
import { createDummyEnemy } from "./lib/createDummyEntities";
import Random from "../utils/Random";
import Game from "../Game";
import Enemy from "../Enemy";

describe('Tests for Enemy class', () => {
    const canvas = createFakeCanvas();
    new Game(canvas);
    Game.random = new Random(10);
    Game.limits = {
        minX: 100,
        maxX: 200,
        minY: 100,
        maxY: 200,
    };

    test('should genere a random position', () => {
        for (let i = 0; i < 100; i++) {
            const enemy = createDummyEnemy(canvas);
            enemy.setPosition(Enemy.generateRandomSpawnPosition(50, 50));
            const pos = enemy.getPosition();
            expect(pos.x).toBeGreaterThan(Game.limits.minX);
            expect(pos.x).toBeLessThan(Game.limits.maxX - 50);
            expect(pos.y).toBeLessThan(Game.limits.maxY);
            expect(pos.y).toEqual(-60);
        }
    });

    test('should kill a enemy', () => {
        const enemy = createDummyEnemy(canvas);
        expect(enemy.die()).toBeTruthy();
        expect(enemy.isDead()).toBeTruthy();
    });
});
