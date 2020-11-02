import { promises as fs } from "fs";
import { parseStringPromise } from "xml2js";
import fetch from "node-fetch";
import { extractSwf } from "./extractSwf";
import { Promise as Bluebird } from "bluebird";
import * as path from "path";

export async function dumpFigureLibraries(
  gordon: string,
  figureMapString: string,
  out: string
) {
  const map = figureMapString;
  const result = await parseStringPromise(map);
  const libs: any[] = result.map.lib;

  await Bluebird.map(
    libs,
    async item => {
      const fileName = `${item["$"].id}.swf`;
      const file = `${gordon}/${fileName}`;
      const response = await fetch(file);
      const buffer = await response.buffer();

      if (response.status !== 200) return;

      const resolvedOutPath = path.resolve(out);
      const swfLocation = path.join(resolvedOutPath, fileName);
      await fs.writeFile(swfLocation, buffer);
      await extractSwf(resolvedOutPath, swfLocation, ["bin"]);
      console.log("Processed", fileName);
    },
    { concurrency: 30 }
  );
}
