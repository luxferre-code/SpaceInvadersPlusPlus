import { describe, test, expect } from "vitest";
import { createFakeCanvas, createHTMLImage } from "./lib/createHTMLElement";
import { createDummyPlayer } from "./lib/createDummyObjects";
import Player from '../Player';

describe("Tests for Player class", () => {
    const canvas = createFakeCanvas();
    const img = createHTMLImage();
    
    test("should be instantiated with default parameters", () => {
        const player = createDummyPlayer(canvas, img);
        expect(player.getScore()).toEqual(0);
        expect(player.getHealth()).toEqual(Player.MAX_HP);
        expect(player.getPosition().x).toEqual(0);
        expect(player.getPosition().y).toEqual(0);
    });
    
    test("should lose a HP", () => {
        const player = createDummyPlayer(canvas, img);
        expect(player.hurt()).toEqual(true);
    });
    
    test("should lose HP and die", () => {
        const player: Player = createDummyPlayer(canvas, img);
        player.setHealth(2);
        expect(player.hurt()).toEqual(true);
        expect(player.hurt()).toEqual(false);
    });
    
    test("should increment score of the player", () => {
        const player = createDummyPlayer(canvas, img);
        player.incrementScore(100);
        expect(player.getScore()).toEqual(100);
    });
});