import { describe, test, expect } from "vitest";
import Enemy from "../Enemy";
import Vector2 from "../Vector2";
import { CanvasMock, ImageMock } from "./Mock";
import Player from "../Player";

describe('Tests for Enemy class', () => {
    test('should genere a random position', () => {
        const vector : Vector2 = Enemy.generateRandomPosition(new CanvasMock() as unknown as HTMLCanvasElement);
        expect(vector.x).toBeGreaterThanOrEqual(0);
        expect(vector.x).toBeLessThanOrEqual(new CanvasMock().getContext('').canvas.clientHeight);
        expect(vector.y).toEqual(0);
    });
    test('should kill a enemy', () => {
        const enemy : Enemy = new Enemy(new CanvasMock() as unknown as HTMLCanvasElement, new Vector2(0, 0), new Vector2(0, 0), new ImageMock() as unknown as HTMLImageElement);
        const player: Player = new Player("Player1", "red", new CanvasMock() as unknown as HTMLCanvasElement, undefined, true, new ImageMock() as unknown as HTMLImageElement);
        expect(enemy.killedBy(player)).toBeTruthy();
        expect(enemy.isDead).toBeTruthy();
        expect(player.score).toEqual(10);
    });
})