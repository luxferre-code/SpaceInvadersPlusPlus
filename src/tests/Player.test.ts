import { describe, test, expect } from "vitest";
import { createFakeCanvas, createHTMLImage } from "./lib/createHTMLElement";
import { createDummyPlayer } from "./lib/createDummyObjects";
import Player from '../Player';
import Vector2 from "../Vector2";

describe("Tests for Player class", () => {
    const canvas = createFakeCanvas();
    const img = createHTMLImage();
    
    test("should be instantiated with default parameters", () => {
        const player = createDummyPlayer(canvas, img);
        expect(player.name).toEqual("Player1");
        expect(player.score).toEqual(0);
        expect(player.color).toEqual("red");
        expect(player.hp).toEqual(5);
        expect(player.position.x).toEqual(0);
        expect(player.position.y).toEqual(0);
        expect(player.speed.x).toEqual(0);
        expect(player.speed.y).toEqual(0);
    });
    
    test("should lost a HP", () => {
        const player = createDummyPlayer(canvas, img);
        expect(player.hurt()).toEqual(true);
    });
    
    test("should lost HP and die", () => {
        const player = createDummyPlayer(canvas, img);
        player.hp = 2;
        expect(player.hurt()).toEqual(true);
        expect(player.hurt()).toEqual(false);
    });
    
    test("should increment score of the player", () => {
        const player = createDummyPlayer(canvas, img);
        player.incrementScore(100);
        expect(player.score).toEqual(100);
    });
    
    test("should move", () => {
        const player = createDummyPlayer(canvas, img);
        player.speed = new Vector2(1, 1);
        player.forceImageLoaded();
        player.move();
        expect(player.position.x).toEqual(1);
        expect(player.position.y).toEqual(1);
    });
    
    test("should move with a speed limiter", () => {
        const player = createDummyPlayer(canvas, img);
        player.speed = new Vector2(10000, 10000);
        Player.maxSpeed = 20;
        player.forceImageLoaded();
        player.move();
        expect(player.position.x).toEqual(20);
        expect(player.position.y).toEqual(20);
    });
    
    test("should move with a negative speed", () => {
        const player = createDummyPlayer(canvas, img);
        player.speed = new Vector2(-1, -1);
        player.position = new Vector2(1, 1);
        player.forceImageLoaded();
        player.move();
        expect(player.position.x).toEqual(0);
        expect(player.position.y).toEqual(0);
    });
    
    test("should move with a negative speed and a speed limiter", () => {
        const player = createDummyPlayer(canvas, img);
        player.speed = new Vector2(-10000, -10000);
        player.position = new Vector2(20, 20);
        player.forceImageLoaded();
        Player.maxSpeed = 20;
        player.move();
        expect(player.position.x).toEqual(0);
        expect(player.position.y).toEqual(0);
    });
    
    test("should not move if the player has no image loaded", () => {
        const player = createDummyPlayer(canvas, img);
        player.speed = new Vector2(1, 1);
        player.move();
        expect(player.position.x).toEqual(0);
        expect(player.position.y).toEqual(0);
    });
    
    test("should not move if the next position is < 0", () => {
        const player = createDummyPlayer(canvas, img);
        player.speed = new Vector2(-1, -1);
        player.forceImageLoaded();
        player.move();
        expect(player.position.x).toEqual(0);
        expect(player.position.y).toEqual(0);
    });
    
    test("should not move if the next position is > canvas.width or canvas.height", () => {
        const player = createDummyPlayer(canvas, img);
        player.speed = new Vector2(100, 100); // should get clamped to (20;20) (the Player's max speed)
        player.position = new Vector2(80, 80); 
        player.forceImageLoaded();
        player.move();
        expect(player.position.x).toEqual(100 - player.skin.width); // 100 is the canvas's clientWidth & clientHeight (the canvas is 100x100)
        expect(player.position.y).toEqual(100 - player.skin.height);
    });
        
    test("should speed decrement automatically *0.9 if player doesn't click", () => {
        const player = createDummyPlayer(canvas, img);
        player.speed = new Vector2(100, 100);
        player.move()
        expect(player.speed.x).toEqual(90);
        expect(player.speed.y).toEqual(90);
    });
});