import { describe, test, expect } from "vitest";
import Vector2 from "../Vector2";

describe("Tests for Vector2 class", () => {
  test("should be instantiated with (0;0) by default", () => {
    const vec2 = new Vector2();
    expect(vec2.x).toEqual(0);
    expect(vec2.y).toEqual(0);
  });
});