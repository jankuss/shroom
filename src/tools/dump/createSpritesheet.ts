/*
MIT License

Copyright (c) 2020 Pencil.js

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import Canvas from "canvas";
import pack from "bin-pack";
import { detectEdges } from "./detectEdges";
import * as path from "path";

const { loadImage, createCanvas } = Canvas;

const defaultOptions = {
  outputFormat: "png",
  margin: 1,
  crop: false,
};

export async function createSpritesheet(
  paths: string[],
  options: { outputFormat?: "png" | "jpeg"; margin?: number; crop?: boolean }
) {
  const { outputFormat, margin, crop } = {
    ...defaultOptions,
    ...options,
  };

  // Check input path
  if (!paths || !paths.length) {
    throw new Error("No file given.");
  }

  // Check outputFormat
  const supportedFormat = ["png", "jpeg"];
  if (!supportedFormat.includes(outputFormat)) {
    const supported = JSON.stringify(supportedFormat);
    throw new Error(
      `outputFormat should only be one of ${supported}, but "${outputFormat}" was given.`
    );
  }

  // Load all images
  const loads = paths.map((path) => loadImage(path));
  const images = await Promise.all(loads);

  const playground = createCanvas(0, 0);
  const playgroundContext = playground.getContext("2d");

  // Crop all image
  const data = await Promise.all(
    images.map(async (source) => {
      const { width, height } = source;
      playground.width = width;
      playground.height = height;
      playgroundContext.drawImage(source, 0, 0);

      const cropped = crop
        ? await detectEdges(playground)
        : {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          };
      return {
        width: width - cropped.left - cropped.right + margin,
        height: height - cropped.top - cropped.bottom + margin,
        source,
        cropped,
      };
    })
  );

  // Pack images
  const { items, width, height } = pack(data);

  const canvas = createCanvas(width + margin, height + margin);
  const context = canvas.getContext("2d");

  // Draw all images on the destination canvas
  items.forEach(({ x, y, item }: { x: number; y: number; item: any }) => {
    context.drawImage(
      item.source,
      x - item.cropped.left + margin,
      y - item.cropped.top + margin
    );
  });

  // Write JSON
  const json = {
    // Global data about the generated file
    meta: {
      app: "Shroom",
      version: 0,
      size: {
        w: width,
        h: height,
      },
      scale: 1,
    },
    frames: items
      .sort((a: any, b: any) =>
        a.item.source.src.localeCompare(b.item.source.src)
      )
      .reduce(
        (
          acc: any,
          {
            x,
            y,
            width: w,
            height: h,
            item,
          }: { x: number; y: number; width: number; height: number; item: any }
        ) => {
          acc[path.basename(item.source.src, ".png")] = {
            // Position and size in the spritesheet
            frame: {
              x: x + margin,
              y: y + margin,
              w: w - margin,
              h: h - margin,
            },
            rotated: false,
            trimmed: Object.values(item.cropped).some(
              (value: any) => value > 0
            ),
            // Relative position and size of the content
            spriteSourceSize: {
              x: item.cropped.left,
              y: item.cropped.top,
              w: w - margin,
              h: h - margin,
            },
            // File image sizes
            sourceSize: {
              w: item.source.width,
              h: item.source.height,
            },
          };
          return acc;
        },
        {}
      ),
  };

  // Write image
  const image = canvas.toBuffer();

  return {
    json,
    image,
  };
}
