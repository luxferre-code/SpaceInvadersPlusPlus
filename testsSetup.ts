import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { beforeAll } from 'vitest';
import { Window } from "happy-dom";

/**
 * Fake a response from `window.fetch()`.
 */
class ResponseFake {
  ok = true;
  constructor(public buffer: Buffer) {}
  async json() {
    return this.buffer.toJSON();
  }
  async text() {
    return this.buffer.toString();
  }
}

// This code is executed before all tests
beforeAll(async () => {
  // To allow the use of `window.fetch()`
  (globalThis.fetch as any) = (filepath: string) => {
    return readFile(resolve(__dirname, filepath)).then(
      (buffer) => new ResponseFake(buffer)
    );
  };

  const window = new Window({ url: 'https://localhost:5173' });
  const document = window.document;

  // `document` is now the fake dom created by "happy-dom"
  (globalThis.document as any) = document;
});