import { fetchFurni } from "./fetchFurni";

import { promises as fs } from "fs";
import * as path from "path";
import { extractSwf } from "./extractSwf";

export async function dumpFurni(
  dcrUrl: string,
  revision: string | undefined,
  name: string,
  folder: string
) {
  const furniDirectory =
    revision != null
      ? path.join(folder, revision, name)
      : path.join(folder, name);
  const revisionDirectory =
    revision != null ? path.join(folder, revision) : path.join(folder);

  try {
    await fs.stat(furniDirectory);
    return;
  } catch (e) {}

  const data = await fetchFurni(dcrUrl, revision, name);

  await fs.mkdir(furniDirectory, { recursive: true });

  await fs.writeFile(
    path.join(revisionDirectory, `${data.name}.swf`),
    data.blob,
    "binary"
  );

  await extractSwf(
    furniDirectory,
    path.join(revisionDirectory, `${data.name}.swf`)
  );
}
