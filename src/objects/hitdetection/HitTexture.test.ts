import { HitTexture } from "./HitTexture";

// To view this image, just copy it and use it as a url in your browser
const testImage =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRF/wAAAAAAQaMSAwAAAAJ0Uk5T/wDltzBKAAAADElEQVR4nGNwYGgAAAFEAME6ehxWAAAAAElFTkSuQmCC";

test("detects first pixel", async () => {
  const texture = await HitTexture.fromUrl(testImage);
  expect(texture.hits(0, 0, { x: 0, y: 0 })).toBe(true);
});

test("doesn't detect second pixel", async () => {
  const texture = await HitTexture.fromUrl(testImage);
  expect(texture.hits(1, 0, { x: 0, y: 0 })).toBe(false);
});

test("detects multiple pixels", async () => {
  const texture = await HitTexture.fromUrl(testImage);
  expect(texture.hits(0, 1, { x: 0, y: 0 })).toBe(false);
  expect(texture.hits(1, 1, { x: 0, y: 0 })).toBe(true);
});
