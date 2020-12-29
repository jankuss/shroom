import Bluebird = require("bluebird");
import { parseStringPromise } from "xml2js";
import { downloadFurni, dumpFurni } from "./dumpFurni";
import { Action } from "./state";

export async function dumpFurniFromFurniData(
  dcrUrl: string,
  furniData: string,
  folder: string,
  dispatch: (action: Action) => void
) {
  console.time("downloadAndDump");

  const data = await parseStringPromise(furniData);

  const furniTypes: any[] = data.furnidata.roomitemtypes[0].furnitype;
  const wallTypes: any[] = data.furnidata.wallitemtypes[0].furnitype;

  const usedIds = new Set<string>();

  // We will filter duplicated values to report the right amount of files to be downloaded and dumped.
  const allFurni: any[] = [...wallTypes, ...furniTypes].reduce(
    (items, item) => {
      const name = item["$"].classname.split("*")[0];

      if (usedIds.has(name)) return items;

      usedIds.add(name);

      return [...items, item];
    },
    []
  );

  dispatch({ type: "FURNI_ASSETS_COUNT", payload: allFurni.length });

  await Bluebird.map(
    allFurni,
    async (value: any) => {
      const name = value["$"].classname.split("*")[0];

      const revision: number | undefined =
        value.revision != null ? value.revision[0] : undefined;

      try {
        await downloadFurni(dcrUrl, revision?.toString(), name, folder);

        dispatch({ type: "FURNI_ASSETS_DOWNLOAD_COUNT" });
      } catch (e) {}
    },
    { concurrency: Infinity } // Safe concurrency to avoid 422 from sulake
  );

  await Bluebird.map(
    allFurni,
    async (value: any) => {
      const name = value["$"].classname.split("*")[0];

      const revision: number | undefined =
        value.revision != null ? value.revision[0] : undefined;

      try {
        await dumpFurni(revision?.toString(), name, folder);

        dispatch({
          type: "FURNI_ASSETS_PROGRESS_SUCCESS",
          payload: { id: name, revision: revision?.toString() },
        });
      } catch (err) {
        // console.log(`Error dumping ${value.revision[0]}/${name}`);
        dispatch({
          type: "FURNI_ASSETS_PROGRESS_ERROR",
          payload: { id: name, revision: revision?.toString() },
        });
      }
    },
    { concurrency: 30 } // Safe concurrency to avoid CPU bottleneck
  );
}
