import { promises as fs } from "fs";
import * as path from "path";

import { ShroomAssetBundle } from "../../assets/ShroomAssetBundle";

export async function dumpFigure(
  baseName: string,
  dumpLocation: string,
  imagePaths: string[]
) {
  const imageFiles = await Promise.all(
    imagePaths.map((path) =>
      fs.readFile(path).then((buffer) => ({ path, buffer }))
    )
  );
  const file = new ShroomAssetBundle();

  imageFiles.forEach(({ path: filePath, buffer }) => {
    const baseName = path.basename(filePath);
    file.addFile(baseName, buffer);
  });

  await fs.writeFile(`${dumpLocation}.shroom`, file.toBuffer());
}
