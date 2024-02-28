import { describe, test, expect } from "vitest";
import Vector2 from "../Vector2";

describe("Tests for Vector2 class", () => {
  test("should be instantiated with (0;0) by default", () => {
    const vec2: Vector2 = new Vector2();
    expect(vec2.x).toEqual(0);
    expect(vec2.y).toEqual(0);
  });
  test('should be instantiated with parameter', () => {
      const vector: Vector2 = new Vector2(1, 2);
      expect(vector.x).toEqual(1);
      expect(vector.y).toEqual(2);
  });
  test('should add two vectors', () => {
      const vector1: Vector2 = new Vector2(1, 2);
      const vector2: Vector2 = new Vector2(3, 4);
      const result: Vector2 = vector1.add(vector2);
      expect(result.x).toEqual(4);
      expect(result.y).toEqual(6);
  });
});