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
  test('should add two vectors with default parameters', () => {
    const vector1 = new Vector2();
    const vector2 = new Vector2();
    const result = vector1.add(vector2);
    expect(result.x).toEqual(0);
    expect(result.y).toEqual(0);
  });
  test('should add a vector with himself', () => {
    const vector = new Vector2(2, 2);
    const result = vector.add(vector);
    expect(result.x).toEqual(4);
    expect(result.y).toEqual(4);
  });
  test('should subtract two vectors', () => {
    const vector1 = new Vector2(1, 2);
    const vector2 = new Vector2(3, 4);
    const result = vector1.sub(vector2);
    expect(result.x).toEqual(-2);
    expect(result.y).toEqual(-2);
  });
  test('should subtract two vectors with default parameters', () => {
    const vector1 = new Vector2();
    const vector2 = new Vector2();
    const result = vector1.sub(vector2);
    expect(result.x).toEqual(0);
    expect(result.y).toEqual(0);
  });
  test('should subtract a vector with himself', () => {
    const vector = new Vector2(2, 2);
    const result = vector.sub(vector);
    expect(result.x).toEqual(0);
    expect(result.y).toEqual(0);
  });
  test('should multiply a vector by a scalar', () => {
    const vector = new Vector2(1, 2);
    const result = vector.mult(2);
    expect(result.x).toEqual(2);
    expect(result.y).toEqual(4);
  });
  test('should multiply a vector by a scalar with default parameters', () => {
    const vector = new Vector2();
    const result = vector.mult(2);
    expect(result.x).toEqual(0);
    expect(result.y).toEqual(0);
  });
  test('should multiply a vector by 0', () => {
    const vector = new Vector2(1, 2);
    const result = vector.mult(0);
    expect(result.x).toEqual(0);
    expect(result.y).toEqual(0);
  });
  test('should multiply a vector by a negative scalar', () => {
    const vector = new Vector2(1, 2);
    const result = vector.mult(-1);
    expect(result.x).toEqual(-1);
    expect(result.y).toEqual(-2);
  });
  test('should multiply a vector by a scalar and set to 0 if < 0.01 && > -0.01', () => {
    const vector = new Vector2(0.0049, 0.0049);
    const result = vector.mult(2);
    expect(result.x).toEqual(0);
    expect(result.y).toEqual(0);
  });
  test('should multiply a vector by a scalar and set to 0 if > -0.01 && < 0.01', () => {
    const vector = new Vector2(-0.0049, -0.0049);
    const result = vector.mult(2);
    expect(result.x).toEqual(0);
    expect(result.y).toEqual(0);
  });
  test('should multiply a vector by a x scalar and a y scalar', () => {
    const vector = new Vector2(1, 2);
    const result = vector.multAxes(2, 3);
    expect(result.x).toEqual(2);
    expect(result.y).toEqual(6);
  });
  test('should multiply a vector by a x scalar and a y scalar with default parameters', () => {
    const vector = new Vector2();
    const result = vector.multAxes(2, 3);
    expect(result.x).toEqual(0);
    expect(result.y).toEqual(0);
  });
  test('should multiply a vector by a x scalar and a y scalar and set to 0 if < 0.01 && > -0.01', () => {
    const vector = new Vector2(0.0049, 0.0049);
    const result = vector.multAxes(2, 2);
    expect(result.x).toEqual(0);
    expect(result.y).toEqual(0);
  });
  test('should multiply a vector by a x scalar and a y scalar and set to 0 if > -0.01 && < 0.01', () => {
    const vector = new Vector2(-0.0049, -0.0049);
    const result = vector.multAxes(2, 2);
    expect(result.x).toEqual(0);
    expect(result.y).toEqual(0);
  });
  test('should divide a vector by a scalar', () => {
    const vector = new Vector2(2, 4);
    const result = vector.div(2);
    expect(result.x).toEqual(1);
    expect(result.y).toEqual(2);
  });
});
