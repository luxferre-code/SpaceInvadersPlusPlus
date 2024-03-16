import { describe, test, expect } from "vitest";
import { createDummyEnemy, createDummyPlayer } from "./lib/createDummyObjects";
import { createFakeCanvas, createHTMLImage } from "./lib/createHTMLElement";
import Bullet from "../Bullet";
import Vector2 from "../Vector2";
import Player from "../Player";
import Enemy from "../Enemy";

describe('Test for Bullet Class', () => {
    const canvas = createFakeCanvas();
    const img = createHTMLImage();

    test('should be created', () => {
        const bullet = new Bullet(createFakeCanvas(), new Vector2());
        expect(bullet.position.x).toEqual(0);
        expect(bullet.position.y).toEqual(0);
        expect(bullet.velocity).toEqual(new Vector2(0, -10));
    });

    test('should be instanciated with 0 parameters', () => {
        const bullet = new Bullet(createFakeCanvas());
        expect(bullet.position).toEqual(new Vector2());
        expect(bullet.velocity).toEqual(new Vector2(0, -10));
    });

    test('should by attached to a player', () => {
        const bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        bullet.attachTo(player);
        Bullet._isVertical = true;
        expect(bullet.position).toEqual(player.getPosition());
        expect(bullet.velocity).toEqual(new Vector2(0, -10));
    });

    test('should by attached to a enemy', () => {
        const bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const enemy: Enemy = createDummyEnemy(canvas, img);
        bullet.attachTo(enemy);
        Bullet._isVertical = true;
        expect(bullet.position).toEqual(enemy.getPosition());
        expect(bullet.velocity).toEqual(new Vector2(0, 10));
    });

    test('should by lost hp to a player', () => {
        const bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        bullet.attachTo(createDummyEnemy(canvas, img));
        bullet.shoot(player);
        expect(player.getHealth()).toBe(Player.MAX_HP - 1);
    });

    test('should by kill a enemy', () => {
        const bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        const enemy: Enemy = createDummyEnemy(canvas, img);
        bullet.attachTo(player);
        expect(enemy.isDead).toBe(false);
        bullet.shoot(enemy);
        expect(enemy.isDead).toBe(true);
    });

    test('shouldn\'t kill a player if sent by himself', () => {
        const bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        const initial_health = player.getHealth();
        bullet.attachTo(player);
        bullet.shoot(player);
        expect(player.getHealth()).toEqual(initial_health);
    });

    test('shouldn\'t kill a enemy if sent by himself', () => {
        const bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const enemy: Enemy = createDummyEnemy(canvas, img);
        bullet.attachTo(enemy);
        expect(enemy.isDead).toBe(false);
        bullet.shoot(enemy);
        expect(enemy.isDead).toBe(false);
    });

    test('shouldn\'t kill a player if sent by a another player', () => {
        const bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        const player2: Player = createDummyPlayer(canvas, img);
        const initial_health = player.getHealth();
        bullet.attachTo(player);
        bullet.shoot(player2);
        expect(player.getHealth()).toEqual(initial_health);
    });

    test('shouldn\'t kill a enemy if sent by a another enemy', () => {
        const bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const enemy: Enemy = createDummyEnemy(canvas, img);
        const enemy2: Enemy = createDummyEnemy(canvas, img);
        bullet.attachTo(enemy);
        expect(enemy.isDead).toBe(false);
        bullet.shoot(enemy2);
        expect(enemy.isDead).toBe(false);
    });

    test('if is attach, should by have the canvas and a image', () => {
        const bullet = new Bullet(createFakeCanvas(), new Vector2(-1, -1));
        const player: Player = createDummyPlayer(canvas, img);
        bullet.attachTo(player);
        expect(bullet.owner).toEqual(player);
    });
});