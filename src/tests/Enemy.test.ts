import { describe, test, expect } from "vitest";
import { createFakeCanvas } from "./lib/createHTMLElement";
import { createDummyEnemy } from "./lib/createDummyEntties";
import Enemy from "../Enemy";
import Vector2 from "../Vector2";

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
    
    test('should move the enemy horizontally', () => {
        Enemy.horizontally = true;
        const enemy = createDummyEnemy(canvas);
        enemy.setSpeed(new Vector2(0, 10));
        enemy.move();
        expect(enemy.getPosition().x).toEqual(0);
        expect(enemy.getPosition().y).toEqual(10);
    });
});