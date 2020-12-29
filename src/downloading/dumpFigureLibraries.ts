import { promises as fs } from "fs";
import { parseStringPromise } from "xml2js";
import { extractSwf } from "./extractSwf";
import { Promise as Bluebird } from "bluebird";
import * as path from "path";
import { Action } from "./state";
import { tryFetchBuffer } from "./fetching";

export async function dumpFigureLibraries(
  gordon: string,
  figureMapString: string,
  out: string,
  dispatch: (action: Action) => void
) {
  const map = figureMapString;
  const result = await parseStringPromise(map);
  const libs: any[] = result.map.lib;

  dispatch({ type: "FIGURE_ASSETS_COUNT", payload: libs.length });

  await Bluebird.map(
    libs,
    async (item) => {
      const id = item["$"].id;
      const fileName = `${id}.swf`;
      const file = `${gordon}/${fileName}`;

      const resolvedOutPath = path.resolve(path.join(out, id));
      await fs.mkdir(resolvedOutPath, { recursive: true });

      const swfLocation = path.join(resolvedOutPath, fileName);
      const downloadSuccess = () =>
        dispatch({ type: "FIGURE_ASSETS_DOWNLOAD_COUNT" });

      try {
        await fs.stat(swfLocation);
        return downloadSuccess();
      } catch (e) {}

      try {
        const buffer = await tryFetchBuffer(file);
        await fs.writeFile(swfLocation, buffer);

        downloadSuccess();
      } catch (e) {
        console.log("dumpFigureLibraries error: ", e);
      }
    },
    { concurrency: Infinity }
  );

  await Bluebird.map(
    libs,
    async (item) => {
      const id = item["$"].id;
      const fileName = `${id}.swf`;
      const binFileName = `${id}_manifest.bin`;

      const resolvedOutPath = path.resolve(path.join(out, id));
      const swfLocation = path.join(resolvedOutPath, fileName);
      const binLocation = path.join(resolvedOutPath, binFileName);

      const success = () =>
        dispatch({ type: "FIGURE_ASSETS_PROGRESS_SUCCESS", payload: fileName });

      // It will skip the dump process if the swf location have been already created
      try {
        await fs.stat(binLocation);
        return success();
      } catch (e) {}

      await extractSwf({
        out: resolvedOutPath,
        swf: swfLocation,
        preserveFileNameFor: ["bin"],
      });

      success();
    },
    { concurrency: 30 }
  );
}
