import { describe, test, expect } from "vitest";
import Bullet from "../Bullet";
import Vector2 from "../Vector2";
import { createDummyEnemy, createDummyPlayer } from "./lib/createDummyObjects";
import { createFakeCanvas, createHTMLImage } from "./lib/createHTMLElement";
import Player from "../Player";
import Enemy from "../Enemy";

describe('Test for Bullet Class', () => {
    const canvas = createFakeCanvas();
    const img = createHTMLImage();

    test('should be created', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas(), new Vector2(0, 0));
        expect(bullet).toBeDefined();
        expect(bullet.position).toEqual(new Vector2(0, 0));
        expect(bullet.velocity).toEqual(new Vector2(0, -10));
    });
    test('should be instanciated with 0 parameters', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas());
        expect(bullet).toBeDefined();
        expect(bullet.position).toEqual(new Vector2(0, 0));
        expect(bullet.velocity).toEqual(new Vector2(0, -10));
    });
    test('should by attached to a player', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        bullet.attachTo(player);
        Bullet._isVertical = true;
        expect(bullet.position).toEqual(player.position);
        expect(bullet.velocity).toEqual(new Vector2(0, -10));
    });
    test('should by attached to a enemy', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const enemy: Enemy = createDummyEnemy(canvas, img);
        bullet.attachTo(enemy);
        Bullet._isVertical = true;
        expect(bullet.position).toEqual(enemy.position);
        expect(bullet.velocity).toEqual(new Vector2(0, 10));
    });
    test('should by lost hp to a player', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        bullet.attachTo(createDummyEnemy(canvas, img));
        player.hp = 5;
        bullet.shoot(player);
        expect(player.hp).toBe(4);
    });
    test('should by kill a enemy', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        const enemy: Enemy = createDummyEnemy(canvas, img);
        bullet.attachTo(player);
        expect(enemy.isDead).toBe(false);
        bullet.shoot(enemy);
        expect(enemy.isDead).toBe(true);
    });
    test('shouldn\'t kill a player if is send by himself', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        bullet.attachTo(player);
        player.hp = 5;
        bullet.shoot(player);
        expect(player.hp).toEqual(5);
    });
    test('shouldn\'t kill a enemy if is send by himself', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const enemy: Enemy = createDummyEnemy(canvas, img);
        bullet.attachTo(enemy);
        expect(enemy.isDead).toBe(false);
        bullet.shoot(enemy);
        expect(enemy.isDead).toBe(false);
    });
    test('shouldn\'t kill a player if is send by a another player', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        const player2: Player = createDummyPlayer(canvas, img);
        bullet.attachTo(player);
        player.hp = 5;
        bullet.shoot(player2);
        expect(player.hp).toEqual(5);
    });
    test('shouldn\'t kill a enemy if is send by a another enemy', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const enemy: Enemy = createDummyEnemy(canvas, img);
        const enemy2: Enemy = createDummyEnemy(canvas, img);
        bullet.attachTo(enemy);
        expect(enemy.isDead).toBe(false);
        bullet.shoot(enemy2);
        expect(enemy.isDead).toBe(false);
    });
    test('if is attach, should by have the canvas and a image', () => {
        const bullet: Bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        bullet.attachTo(player);
        expect(bullet.canvas).toBeDefined();
        expect(bullet.image).toBeDefined();
    });
});