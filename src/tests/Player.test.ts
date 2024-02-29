import { describe, test, expect } from "vitest";
import Player from '../Player';

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
});