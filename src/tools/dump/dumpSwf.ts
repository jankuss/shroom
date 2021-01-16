import { promises as fs } from "fs";
import * as path from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { readFromBufferP, extractImages } = require("swf-extract");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SWFReader = require("@gizeta/swf-reader");

export async function dumpSwf(swfPath: string) {
  const rawData = await fs.readFile(swfPath);
  const swfObject = SWFReader.readSync(swfPath);
  const swf = await readFromBufferP(rawData);
  const assetMap = getAssetMapFromSWF(swfObject);

  const dirName = path.dirname(swfPath);
  const baseName = path.basename(swfPath, ".swf");

  const dumpLocation = path.join(dirName, baseName);

  await fs.mkdir(dumpLocation, { recursive: true });

  await extractXml(swfObject, assetMap, dumpLocation, baseName);
  await extractSwfImages(swf, assetMap, dirName, baseName);
}

function getAssetMapFromSWF(swf: SWF) {
  const assetMap = new Map<number, string[]>();
  for (const tag of swf.tags) {
    if (tag.header.code == 76) {
      for (const asset of tag.symbols) {
        const current = assetMap.get(asset.id) ?? [];
        assetMap.set(asset.id, [...current, asset.name]);
      }
    }
  }
  return assetMap;
}

async function extractSwfImages(
  swf: any,
  assetMap: Map<number, string[]>,
  folderName: string,
  basename: string
) {
  const images: any[] = await Promise.all(extractImages(swf.tags));

  for (const image of images) {
    const assets = assetMap.get(image.characterId) ?? [];

    for (const rawName of assets) {
      const fileName = rawName.substr(basename.length + 1) + ".png";
      const savePath = path.join(folderName, basename, fileName);

      await fs.writeFile(savePath, image.imgData, "binary");
    }
  }
}

async function extractXml(
  swf: SWF,
  assetMap: Map<number, string[]>,
  folderName: string,
  basename: string
) {
  for (const tag of swf.tags) {
    if (tag.header.code == 87) {
      const buffer = tag.data;
      const characterId = buffer.readUInt16LE();

      const value = assetMap.get(characterId) ?? [];
      for (const rawName of value) {
        const fileName = rawName.substr(basename.length + 1) + ".bin";

        await fs.writeFile(
          path.join(folderName, fileName),
          buffer.subarray(6),
          "binary"
        );
      }
    }
  }
}

interface SWFTag {
  header: { code: number };
  symbols: SWFSymbol[];
  data: Buffer;
}
interface SWFSymbol {
  id: number;
  name: string;
}

interface SWF {
  tags: SWFTag[];
}
