import { readFile } from "fs/promises";
import { describe, expect, test } from "vitest";
import { Browser } from "happy-dom";

describe("Testing the UI abstraction", async () => {
  // Helper functions:

  function keepUndefinedElementsOnlyFrom(o: Object) {
    return Object.values(o).filter(e => e === undefined);
  }

  function isHidden(element: HTMLElement) {
    return element.getAttribute("aria-hidden") === "true";
  }

  // The goal here is to simulate a web browser.
  // The simulated web browser is based on the `index.html` file
  // that is being read dynamically using NodeJS.
  // Only the contents of the <body> tag are kept
  // to avoid loading unncessary CSS or JS files.

  const indexPage = (await readFile("index.html")).toString();
  const indexBody = indexPage.substring(indexPage.indexOf('<body>') + "<body>".length, indexPage.indexOf('</body>'));
  const browser = new Browser();
  const page = browser.newPage();
  page.content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      ${indexBody}
    </body>
    </html>
  `;

  // Use this variable for the tests.
  // It basically simulates the DOM.
  const document = page.mainFrame.document;
  (globalThis as any).document = document;

  // It has to be imported this way
  // because the static properties get evaluated 
  // as soon as it gets imported into a script.
  // Therefore, if we were to import it normally
  // then the `document` property would not be the right one,
  // and since the objects are frozen & readonly
  // there would not be any way to change that.
  const UI = (await import("../UI")).default;

  test("should have initialized UI correctly in this simulation", () => {
    expect(UI).toBeDefined();
  });

  test("should have frozen all inner objects", () => {
    expect(Object.isFrozen(UI.cornerButtons)).toBe(true);
    expect(Object.isFrozen(UI.mainButtons)).toBe(true);
  });

  test("should have no undefined element", () => {
    expect(UI.ui).toBeDefined();
    expect(keepUndefinedElementsOnlyFrom(UI.cornerButtons)).toHaveLength(0);
    expect(keepUndefinedElementsOnlyFrom(UI.mainButtons)).toHaveLength(0);
  });

  test("should hide or show UI", () => {
    expect(isHidden(UI.ui)).toBe(false);
    UI.hideUI();
    expect(isHidden(UI.ui)).toBe(true);
    UI.hideUI(); // hiding it whereas it's already hidden shouldn't change anything
    expect(isHidden(UI.ui)).toBe(true);
    UI.showUI();
    expect(isHidden(UI.ui)).toBe(false);
    UI.showUI();
    expect(isHidden(UI.ui)).toBe(false);
  });

  // Let's keep it clean :)
  await browser.close();
});