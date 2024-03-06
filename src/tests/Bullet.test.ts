import { describe, test, expect } from "vitest";
import Bullet from "../Bullet";
import Vector2 from "../Vector2";

describe('Test for Bullet Class', () => {
    test('Bullet should be created', () => {
        const bullet: Bullet = new Bullet(new Vector2(0, 0));
        expect(bullet).toBeDefined();
        expect(bullet.position).toEqual(new Vector2(0, 0));
        expect(bullet.velocity).toEqual(new Vector2(0, 0));
    });
})