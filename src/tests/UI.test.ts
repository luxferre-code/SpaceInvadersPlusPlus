import { readFile } from "fs/promises";
import { describe, expect, test } from "vitest";
import { Browser } from "happy-dom";
import createHTMLElement from "./lib/createHTMLElement";

describe("Testing the UI abstraction", async () => {
  function keepUndefinedElementsOnlyFrom(o: Object) {
    return Object.values(o).filter(e => e === undefined);
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
  (globalThis as any).localStorage = page.mainFrame.window.localStorage;

  // It has to be imported this way
  // because the static properties get evaluated 
  // as soon as it gets imported into a script.
  // Therefore, if we were to import it normally
  // then the `document` property would not be the right one,
  // and since the objects are frozen & readonly
  // there would not be any way to change that.
  const UI = (await import("../ui/UI")).default;
  const SettingsPage = (await import("../ui/SettingsPage")).default;
  const SettingsDB = (await import("../server/SettingsDB")).default;

  // The player settings shared for the entire test suite.
  const settings: PlayerSettings = {
    effectsVolume: 60,
    musicVolume: 20,
    name: "Thomas",
    skin: 1
  };

  test("should have initialized UI correctly in this simulation", () => {
    expect(UI == null).toBe(false);
  });

  test("should have frozen all inner objects", () => {
    expect(Object.isFrozen(UI.cornerButtons)).toBe(true);
    expect(Object.isFrozen(UI.mainButtons)).toBe(true);
    expect(Object.isFrozen(UI.modalPages)).toBe(true);
  });

  test("should have no undefined element", () => {
    expect(UI.ui == null).toBe(false);
    expect(UI.modal == null).toBe(false);
    expect(UI.rankingTable == null).toBe(false);
    expect(keepUndefinedElementsOnlyFrom(UI.cornerButtons)).toHaveLength(0);
    expect(keepUndefinedElementsOnlyFrom(UI.mainButtons)).toHaveLength(0);
    expect(keepUndefinedElementsOnlyFrom(UI.modalPages)).toHaveLength(0);
  });

  test("should have a defined ranking table", () => {
    expect(UI.rankingTable.personalScore == null).toBe(false);
    expect(UI.rankingTable.personalScoreBtn == null).toBe(false);
    expect(UI.rankingTable.personalRank == null).toBe(false);
    expect(UI.rankingTable.arrow == null).toBe(false);
    expect(UI.rankingTable.last10ScoresTable == null).toBe(false);
    expect(UI.rankingTable.last10ScoresLabel == null).toBe(false);
    expect(UI.rankingTable.worldWideRecordsTable == null).toBe(false);
    expect(UI.rankingTable.worldWideRecords == null).toBe(false);
    for (const key of (["first", "second", "third"] as RankingKey[])) {
      expect(key in UI.rankingTable.worldWideRecords).toBe(true);
      expect(UI.rankingTable.worldWideRecords[key].name).not.toBeNull();
      expect(UI.rankingTable.worldWideRecords[key].highestScore == null).toBe(false);
    }
  });

  test("should be hidden", () => {
    const dummyElement = createHTMLElement("div");
    expect(UI.isHidden(dummyElement)).toBe(false);
    dummyElement.setAttribute("aria-hidden", "true");
    expect(UI.isHidden(dummyElement)).toBe(true);
  });

  test("should hide or show UI", () => {
    expect(UI.isHidden(UI.ui)).toBe(false);
    UI.hideUI();
    expect(UI.isHidden(UI.ui)).toBe(true);
    UI.hideUI(); // hiding it whereas it's already hidden shouldn't change anything
    expect(UI.isHidden(UI.ui)).toBe(true);
    UI.showUI();
    expect(UI.isHidden(UI.ui)).toBe(false);
    UI.showUI();
    expect(UI.isHidden(UI.ui)).toBe(false);
  });

  test("should have no opened modal page", () => {
    for (const page of Object.values(UI.modalPages)) {
      expect(UI.isHidden(page)).toBe(true);
    }
  })

  test("should have the modal closed by default", () => {
    expect(UI.isModalOpen()).toBe(false);
  })

  test("should open or hide the modal", () => {
    expect(UI.isModalOpen()).toBe(false);
    expect(UI.hasModalPageVisible()).toBe(false);
    expect(UI.getVisibleModalPage()).toBeUndefined();
    expect(UI.isHidden(UI.modalPages.credits)).toBe(true);

    UI.showModal(UI.modalPages.credits);
    expect(UI.hasModalPageVisible()).toBe(true);
    expect(UI.getVisibleModalPage()?.isSameNode(UI.modalPages.credits)).toBe(true);
    expect(UI.isHidden(UI.modalPages.credits)).toBe(false);
    expect(UI.isModalOpen()).toBe(true);

    UI.showModal(UI.modalPages.credits);
    expect(UI.isModalOpen()).toBe(true);
    expect(UI.isHidden(UI.modalPages.credits)).toBe(false);

    UI.closeModal();
    expect(UI.isModalOpen()).toBe(false);
    UI.closeModal();
    expect(UI.isModalOpen()).toBe(false);
  });

  test("should control the table of the ranking page with less than 5 scores", () => {
    const scores = [
      {
        score: 55,
        date: new Date()
      },
      {
        score: 66,
        date: new Date()
      }
    ];
    UI.rankingTable.build10LastScores(scores);
    const tables = UI.rankingTable.last10ScoresTable.querySelectorAll("table");
    expect(tables).toHaveLength(2);
    const trs = tables[0].querySelectorAll("tbody > tr");
    expect(trs).toHaveLength(5);
    const td1 = trs[0].querySelectorAll("td");
    expect(td1).toHaveLength(1);
    const spans = td1[0].querySelectorAll("span");
    expect(spans).toHaveLength(2);
    expect(spans[0].textContent).toEqual(scores[0].date.toLocaleDateString());
    expect(spans[1].textContent).toEqual(scores[0].score.toString());
  });

  test("should control the table of the ranking page with more than 5 scores", () => {
    const scores = [
      { score: 11, date: new Date() },
      { score: 22, date: new Date() },
      { score: 33, date: new Date() },
      { score: 44, date: new Date() },
      { score: 55, date: new Date() },
      { score: 66, date: new Date() },
    ];
    UI.rankingTable.build10LastScores(scores);
    const tables = UI.rankingTable.last10ScoresTable.querySelectorAll("table");
    expect(tables).toHaveLength(2);
    expect(tables[0].querySelectorAll('tbody > tr')).toHaveLength(5);
    expect(tables[1].querySelectorAll('tbody > tr')).toHaveLength(5);
    expect(tables[1].querySelectorAll('tbody > tr:nth-child(3) span')).toHaveLength(2);
  });

  test("shouldn't have any undefined field in SettingsPage", () => {
    expect(SettingsPage.inputName == null).toBe(false);
    expect(SettingsPage.skinChoices == null).toBe(false);
    expect(SettingsPage.skinChoices).toHaveLength(3);
    expect(SettingsPage.musicInput == null).toBe(false);
    expect(SettingsPage.effectsInput == null).toBe(false);
  });

  test("should initialize SettingsPage correctly with initial settings", () => {
    SettingsPage.initWith(settings);
    expect(SettingsPage.inputName.value).toStrictEqual(settings.name);
    expect(SettingsPage.skinChoices[1].classList.contains("selected")).toBe(true);
    expect(SettingsPage.musicInput.value).toEqual(settings.musicVolume.toString());
    expect(SettingsPage.effectsInput.value).toEqual(settings.effectsVolume.toString());
  });

  test("should listen to skin changes", () => {
    expect(SettingsPage.skinChoices[settings.skin].classList.contains("selected")).toBe(true);
    expect(SettingsPage.skinChoices[0].classList.contains("selected")).toBe(false);
    expect(SettingsPage.skinChoices[2].classList.contains("selected")).toBe(false);
    SettingsPage.listenToSkinChange((newSkin) => {
      expect(SettingsPage.skinChoices[0].classList.contains("selected")).toBe(false);
      expect(SettingsPage.skinChoices[1].classList.contains("selected")).toBe(false);
      expect(SettingsPage.skinChoices[newSkin].classList.contains("selected")).toBe(true);
      console.log("clicked");
    });
    SettingsPage.skinChoices[2].click();
  });

  test("should force change the name", () => {
    SettingsPage.forceChangePlayerName("NewName");
    expect(SettingsPage.inputName.value).toStrictEqual("NewName");
  });

  test("should have default settings stored in local storage", () => {
    expect(localStorage.getItem("SpaceInvadersPlayerSettings")).not.toEqual(null);
    const parsed = JSON.parse(localStorage.getItem("SpaceInvadersPlayerSettings")!) as PlayerSettings;
    expect(parsed.effectsVolume).toEqual(SettingsDB.effectsVolume);
    expect(parsed.musicVolume).toEqual(SettingsDB.musicVolume);
    expect(parsed.name).toEqual(SettingsDB.name);
    expect(parsed.skin).toEqual(SettingsDB.skin);
  });

  test("should save changes to local storage", () => {
    expect(localStorage.getItem("SpaceInvadersPlayerSettings")).not.toEqual(null);
    SettingsDB.name = "Yoyo";
    SettingsDB.effectsVolume = 10;
    SettingsDB.musicVolume = 0;
    SettingsDB.skin = 2;
    const parsed = JSON.parse(localStorage.getItem("SpaceInvadersPlayerSettings")!) as PlayerSettings;
    expect(parsed.effectsVolume).toEqual(10);
    expect(parsed.musicVolume).toEqual(0);
    expect(parsed.name).toEqual("Yoyo");
    expect(parsed.skin).toEqual(2);
  });

  // Let's keep it clean :)
  await browser.close();
});