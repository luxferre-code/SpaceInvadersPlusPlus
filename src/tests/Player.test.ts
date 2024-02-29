import { describe, test, expect } from "vitest";
import Player from '../Player';
import Vector2 from "../Vector2";

class CanvasMock {
    getContext(context: string) {
        return {
            fillRect: () => {}
        };
    }
}

class ImageMock {
    src: string = "";
}

describe("Tests for Player class", () => {
    test('should be instantiated with default parameters', () => {
        const player: Player = new Player("Player1", "red", new CanvasMock() as unknown as HTMLCanvasElement, undefined, false, new ImageMock() as unknown as HTMLImageElement);
        expect(player.name).toEqual("Player1");
        expect(player.score).toEqual(0);
        expect(player.color).toEqual("red");
        expect(player.hp).toEqual(5);
        expect(player.position.x).toEqual(0);
        expect(player.position.y).toEqual(0);
        expect(player.speed.x).toEqual(0);
        expect(player.speed.y).toEqual(0);
    });
    test('should can lost a HP', () => {
        const player: Player = new Player("Player1", "red", new CanvasMock() as unknown as HTMLCanvasElement, undefined, false, new ImageMock() as unknown as HTMLImageElement);
        expect(player.lostHP()).toEqual(true);
    });
    test('should can lost HP and die', () => {
        const player: Player = new Player("Player1", "red", new CanvasMock() as unknown as HTMLCanvasElement, undefined, false, new ImageMock() as unknown as HTMLImageElement);
        player.hp = 2;
        expect(player.lostHP()).toEqual(true);
        expect(player.lostHP()).toEqual(false);
    });
    test('should can increment score of the player', () => {
        const player: Player = new Player("Player1", "red", new CanvasMock() as unknown as HTMLCanvasElement, undefined, false, new ImageMock() as unknown as HTMLImageElement);
        player.incrementScore(100);
        expect(player.score).toEqual(100);
    });
    test('should can move', () => {
        const player: Player = new Player("Player1", "red", new CanvasMock() as unknown as HTMLCanvasElement, undefined, false, new ImageMock() as unknown as HTMLImageElement);
        player.speed = new Vector2(1, 1);
        player.move();
        expect(player.position.x).toEqual(1);
        expect(player.position.y).toEqual(1);
    });
    test('should can move with a speed limiter', () => {
        const player: Player = new Player("Player1", "red", new CanvasMock() as unknown as HTMLCanvasElement, undefined, false, new ImageMock() as unknown as HTMLImageElement);
        player.speed = new Vector2(10000, 10000);
        Player.maxSpeed = 20;
        player.move();
        expect(player.position.x).toEqual(20);
        expect(player.position.y).toEqual(20);
    });
    test('should move with a negative speed', () => {
        const player: Player = new Player("Player1", "red", new CanvasMock() as unknown as HTMLCanvasElement, undefined, false, new ImageMock() as unknown as HTMLImageElement);
        player.speed = new Vector2(-1, -1);
        player.move();
        expect(player.position.x).toEqual(-1);
        expect(player.position.y).toEqual(-1);
    })
});