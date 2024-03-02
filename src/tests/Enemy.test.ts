import { describe, test, expect } from "vitest";
import Enemy from "../Enemy";
import Vector2 from "../Vector2";
import { CanvasMock } from "./Mock";

describe('Tests for Enemy class', () => {
    test('should genere a random position', () => {
        const vector : Vector2 = Enemy.generateRandomPosition(new CanvasMock() as unknown as HTMLCanvasElement);
        expect(vector.x).toBeGreaterThanOrEqual(0);
        expect(vector.x).toBeLessThanOrEqual(new CanvasMock().getContext('').canvas.clientHeight);
        expect(vector.y).toEqual(0);
    });
})