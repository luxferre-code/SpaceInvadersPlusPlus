/**
 * The skins of the game.
 * It has to be attached to a number that
 * matches it description in the HTML settings page.
 * 
 * It's a "const" enum, so the individual properties
 * are replaced by their value in the JavaScript output.
 * 
 * Do not change the values under any circumstances,
 * as it might break the game for people
 * who have already played it.
 * 
 * The properties have explicit values to make sure
 * that the order in which they are declared don't matter.
 */
export const enum Skin {
  RED = 0,
  GREEN = 1,
  PURPLE = 2
}

/**
 * Since the Skin enum is constant,
 * we define a global property whose value
 * is the highest value a skin can have.
 * 
 * If skins are added, this must be changed to the last skin.
 */
export const SkinMaximum = Skin.PURPLE;

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