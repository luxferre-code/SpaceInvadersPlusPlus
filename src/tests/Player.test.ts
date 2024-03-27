import { describe, test, expect } from "vitest";
import { createFakeCanvas } from "./lib/createHTMLElement";
import { createDummyPlayer } from "./lib/createDummyEntties";
import Player from '../Player';

describe("Tests for Player class", () => {
    const canvas = createFakeCanvas();
    
    test("should be instantiated with default parameters", () => {
        const player = createDummyPlayer(canvas);
        expect(player.getPosition().x).toEqual(0);
        expect(player.getPosition().y).toEqual(0);
    });
    
    test("should lose a HP", () => {
        const player = createDummyPlayer(canvas);
        expect(player.hurt()).toEqual(true);
        expect(player.isImmuned()).toEqual(true);
        setTimeout(() => {
            expect(player.isImmuned()).toEqual(false);
        }, 1000);
    });
    
    test("should lose HP and die", () => {
        const player: Player = createDummyPlayer(canvas);
        player.setHealth(2);
        expect(player.hurt()).toEqual(true);
        expect(player.hurt()).toEqual(true); // since the player is immuned
        setTimeout(() => {
            expect(player.hurt()).toEqual(false);
        }, 1000);
    });
});
