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
      } catch (e) {}
    },
    { concurrency: Infinity } // We can use this limit because if the download get stucked, we will retry it after a short time ;)
  );

  await Bluebird.map(
    libs,
    async (item) => {
      const id = item["$"].id;
      const fileName = `${id}.swf`;
      const manifestFileName = `${id}_manifest.bin`;

      const resolvedOutPath = path.resolve(path.join(out, id));
      const swfLocation = path.join(resolvedOutPath, fileName);
      const manifestFileLocation = path.join(resolvedOutPath, manifestFileName);

      const success = () =>
        dispatch({ type: "FIGURE_ASSETS_PROGRESS_SUCCESS", payload: fileName });

      // It will skip the dump process if the manifest file have been already created
      try {
        await fs.stat(manifestFileLocation);
        return success();
      } catch (e) {}

      await extractSwf({
        out: resolvedOutPath,
        swf: swfLocation,
        preserveFileNameFor: ["bin"],
      });

      return success();
    },
    { concurrency: 30 } // Safe concurrency to avoid CPU bottleneck
  );
}
