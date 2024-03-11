import { describe, expect, test } from "vitest";
import Ranking from "../models/Ranking";

describe("Test ranking model", () => {
  test("should work with 0 scores", () => {
    const ranking = new Ranking("Bob", []);
    expect(ranking.getName()).toStrictEqual("Bob");
    expect(ranking.getBestScore()).toStrictEqual(0);
    expect(ranking.getScores()).toHaveLength(0);
  });

  test("should work with 1 score", () => {
    const ranking = new Ranking("John Doe", [ { score: 50, date: new Date() } ]);
    expect(ranking.getName()).toStrictEqual("John Doe");
    expect(ranking.getBestScore()).toStrictEqual(50);
    expect(ranking.getScores()).toHaveLength(1);
  });

  test("should work with several scores", () => {
    const ranking = new Ranking("Jane Doe", [ { score: 50, date: new Date() }, { score: 80, date: new Date() }, { score: 999, date: new Date() } ]);
    expect(ranking.getName()).toStrictEqual("Jane Doe");
    expect(ranking.getBestScore()).toStrictEqual(999);
    expect(ranking.getScores()).toHaveLength(3);
    expect(ranking.getScores()[0].score).toStrictEqual(999);
    expect(ranking.getScores()[1].score).toStrictEqual(80);
    expect(ranking.getScores()[2].score).toStrictEqual(50);
  });
});