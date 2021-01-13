import * as path from "path";

import { promises as fs } from "fs";
import { fetchFurni } from "./fetchFurni";
import { extractSwf } from "./extractSwf";

export const downloadFurni = async (
  dcrUrl: string,
  revision: string | undefined,
  name: string,
  folder: string
) => {
  const furniDirectory = revision
    ? path.join(folder, revision, name)
    : path.join(folder, name);

  const revisionDirectory = revision
    ? path.join(folder, revision)
    : path.join(folder);

  // This code will act like a cache, it will skip the download if the file have been already downloaded.
  try {
    const downloadedSwfFile = path.resolve(path.join(`${furniDirectory}.swf`));
    await fs.stat(downloadedSwfFile);
    return;
  } catch (e) {
    // Do nothing
  }

  const furniture = await fetchFurni(dcrUrl, revision, name);

  await fs.mkdir(furniDirectory, { recursive: true });

  await fs.writeFile(
    path.join(revisionDirectory, `${furniture.name}.swf`),
    furniture.buffer,
    "binary"
  );
};

export async function dumpFurni(
  revision: string | undefined,
  name: string,
  folder: string
) {
  const furniDirectory = revision
    ? path.join(folder, revision, name)
    : path.join(folder, name);

  const revisionDirectory = revision
    ? path.join(folder, revision)
    : path.join(folder);

  // This code will act like a cache, it will skip the dump if the swf have already been dumped.
  try {
    const binFileName = `manifest.bin`;
    const binPath = path.resolve(path.join(furniDirectory, binFileName));
    await fs.stat(binPath);
    return;
  } catch (e) {
    // Do nothing
  }

  await extractSwf({
    out: furniDirectory,
    swf: path.join(revisionDirectory, `${name}.swf`),
  });
}
