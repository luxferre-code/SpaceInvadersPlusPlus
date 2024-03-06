import { describe, test, expect } from "vitest";
import Bullet from "../Bullet";
import Vector2 from "../Vector2";
import { createDummyPlayer } from "./lib/createDummyObjects";
import { createFakeCanvas, createHTMLImage } from "./lib/createHTMLElement";
import Player from "../Player";

describe('Test for Bullet Class', () => {
    const canvas = createFakeCanvas();
    const img = createHTMLImage();

    test('should be created', () => {
        const bullet: Bullet = new Bullet(new Vector2(0, 0));
        expect(bullet).toBeDefined();
        expect(bullet.position).toEqual(new Vector2(0, 0));
        expect(bullet.velocity).toEqual(new Vector2(0, 0));
    });
    test('should be instanciated with 0 parameters', () => {
        const bullet: Bullet = new Bullet();
        expect(bullet).toBeDefined();
        expect(bullet.position).toEqual(new Vector2(0, 0));
        expect(bullet.velocity).toEqual(new Vector2(0, 0));
    });
    test('should by attached to a player', () => {
        const bullet: Bullet = new Bullet(new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        bullet.attachTo(player);
        Bullet._isVertical = true;
        expect(bullet.position).toEqual(player.position);
        expect(bullet.velocity).toEqual(new Vector2(0, -10));
    });
})