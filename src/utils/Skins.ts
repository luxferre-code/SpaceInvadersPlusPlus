/**
 * The skins of the game.
 * It has to be attached to a number that
 * matches it description in the HTML settings page.
 * 
 * Do not change the values under any circumstances,
 * as it might break the game for people who have
 * already saved their own custom settings
 * into local storage.
 */
export enum Skin {
    RED,
    GREEN,
    PURPLE,
    // Do not change the order in which the skins are declared.
}

/**
 * The pre-loaded HTML elements for each skin.
 */
export const SkinImages: HTMLImageElement[] = [];

/**
 * Since the Skin enum is not meant to change,
 * we define a global property whose value
 * is the highest value a skin can have.
 * 
 * Note that the `Object.values()` on an TypeScript non-const enum also include the keys,
 * but the very last element in the generated array is the value of the last member,
 * and that's what we want here.
 */
export const SkinMaximum: number = Object.values(Skin).at(-1) as number;

/**
 * Gets the image URL that matches the given skin.
 * If the skin isn't valid, then the RED one is returned.
 * @param skin The ID of the skin as specified in the {@link Skin} enum.
 * @returns The URL that matches the given skin ID.
 */
export function getSkinURL(skin: number): string {
    switch (skin) {
        case Skin.GREEN: return "/assets/skins/skin-green.png";
        case Skin.PURPLE: return "/assets/skins/skin-purple.png";
        default:
            return "/assets/skins/skin-red.png";
    }
}

/**
 * Gets the pre-loaded Image element for a given skin.
 */
export function getSkinImage(skin: Skin): HTMLImageElement {
    return SkinImages[skin];
}

/**
 * Pre-loads the Image element for each image.
 */
export async function preloadSkins(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (let skin = 0; skin <= SkinMaximum; skin++) {
        const image = new Image();
        image.src = getSkinURL(skin);
        SkinImages.push(image);
        promises.push(new Promise((resolve, reject) => {
            image.onerror = () => reject(`The image for the skin ${Skin[skin]} wasn't properly loaded.`);
            image.onload = () => resolve();
        }));
    }
    await Promise.all(promises);
}
