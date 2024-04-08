import { readFile } from "fs/promises";
import { describe, expect, test } from "vitest";
import { Browser } from "happy-dom";
import createHTMLElement from "./lib/createHTMLElement";
import { Skin } from "../utils/Skins";

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
    const GameSettingsPage = (await import("../ui/GameSettingsPage")).default;
    const SettingsDB = (await import("../db/GlobalSettingsDB")).default;

    // The player settings shared for the entire test suite.
    const settings: PlayerSettings = {
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
        expect(UI.containerScore == null).toBe(false);
        expect(keepUndefinedElementsOnlyFrom(UI.cornerButtons)).toHaveLength(0);
        expect(keepUndefinedElementsOnlyFrom(UI.mainButtons)).toHaveLength(0);
        expect(keepUndefinedElementsOnlyFrom(UI.modalPages)).toHaveLength(0);
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

    test("shouldn't have any undefined field in SettingsPage", () => {
        expect(SettingsPage.inputName == null).toBe(false);
        expect(SettingsPage.skinChoices == null).toBe(false);
        expect(SettingsPage.skinChoices).toHaveLength(3);
        expect(SettingsPage.musicInput == null).toBe(false);
    });

    test("should initialize SettingsPage correctly with initial settings", () => {
        SettingsPage.initWith(settings);
        expect(SettingsPage.inputName.value).toStrictEqual(settings.name);
        expect(SettingsPage.skinChoices[1].classList.contains("selected")).toBe(true);
        expect(SettingsPage.musicInput.value).toEqual(settings.musicVolume.toString());
    });

    test("should listen to skin changes", () => {
        expect(SettingsPage.skinChoices[settings.skin].classList.contains("selected")).toBe(true);
        expect(SettingsPage.skinChoices[0].classList.contains("selected")).toBe(false);
        expect(SettingsPage.skinChoices[2].classList.contains("selected")).toBe(false);
        SettingsPage.listenToSkinChange((newSkin) => {
            expect(SettingsPage.skinChoices[0].classList.contains("selected")).toBe(false);
            expect(SettingsPage.skinChoices[1].classList.contains("selected")).toBe(false);
            expect(SettingsPage.skinChoices[newSkin].classList.contains("selected")).toBe(true);
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
        expect(parsed.musicVolume).toEqual(SettingsDB.musicVolume);
        expect(parsed.name).toEqual(SettingsDB.name);
        expect(parsed.skin).toEqual(SettingsDB.skin);
    });

    test("should save changes to local storage", () => {
        expect(localStorage.getItem("SpaceInvadersPlayerSettings")).not.toEqual(null);
        SettingsDB.name = "Yoyo";
        SettingsDB.musicVolume = 0;
        SettingsDB.skin = Skin.PURPLE;
        const parsed = JSON.parse(localStorage.getItem("SpaceInvadersPlayerSettings")!) as PlayerSettings;
        expect(parsed.musicVolume).toEqual(0);
        expect(parsed.name).toEqual("Yoyo");
        expect(parsed.skin).toEqual(Skin.PURPLE);
    });

    test("should have disabled inputs by default in the GameSettingsPage", () => {
        const customizableInputs = Array.from(document.querySelectorAll("#game-settings-page .game-specific-settings input")) as any as HTMLInputElement[];
        const disabledInputs = Array.from(document.querySelectorAll("#game-settings-page .game-specific-settings input:disabled")) as any as HTMLInputElement[];
        expect(customizableInputs).toHaveLength(disabledInputs.length);
        for (let i = 0; i < disabledInputs.length; i++) {
            expect(disabledInputs[i].isSameNode(customizableInputs[i])).toBe(true);
        }
    });

    test("shouldn't have any undefined element for the GameSettingsPage", () => {
        // The initialize method would throw an error
        // if they were any undefined element.
        try {
            GameSettingsPage.initDefaultGameSettings();
        } catch (e) {
            expect(true).toBe(false);
        }
    });

    // Let's keep it clean :)
    await browser.close();
});
