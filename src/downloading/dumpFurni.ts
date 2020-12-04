import { fetchFurni } from "./fetchFurni";

import { promises as fs } from "fs";
import * as path from "path";
import { extractSwf } from "./extractSwf";

export async function dumpFurni(
  dcrUrl: string,
  revision: string,
  name: string,
  folder: string
) {
  const dir = path.join(folder, revision, name);

  try {
    await fs.stat(dir);
    return;
  } catch (e) {}

  const data = await fetchFurni(dcrUrl, revision, name);

  await fs.mkdir(path.join(folder, revision, data.name), { recursive: true });

  await fs.writeFile(
    path.join(folder, data.revision, `${data.name}.swf`),
    data.blob,
    "binary"
  );

  await extractSwf(
    path.join(folder, revision, data.name),
    path.join(folder, data.revision, `${data.name}.swf`)
  );
}
