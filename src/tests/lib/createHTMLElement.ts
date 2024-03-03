/**
 * Creates an HTMT element for the tests.
 * @param tagName The HTML tag.
 * @returns An HTML element that corresponds to the given tag.
 */
export default function<T = HTMLElement>(tagName: string) {
  return document.createElement(tagName) as T;
}

/**
 * Creates a fake canvas with an initial size of 100x100 pixels.
 * It has to be faked because having an actual Canvas in NodeJS
 * is quite annoying, but it should be enough for most tests.
 * @param size The size of the canvas, which defaults to 100.
 * @returns A faked object of type HTMLCanvasElement.
 */
export function createFakeCanvas(size: number = 100): HTMLCanvasElement {
  return {
    width: size,
    height: size,
    getContext: function(_: '2d') {
      return {
        canvas: {
          clientWidth: size,
          clientHeight: size
        }
      };
    }
  } as any as HTMLCanvasElement;
}

/**
 * Creates an HTMLImageElement to be used in tests.
 * @param src The value of the `src` attribute.
 * @param size The size of the image (which defaults to 10).
 * @returns An HTMLImageElement.
 */
export function createHTMLImage(src: string = "", size: number = 10): HTMLImageElement {
  const img = document.createElement("img");
  img.src = src;
  img.width = size;
  img.height = size;
  return img;
}