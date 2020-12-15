import Bluebird = require("bluebird");
import { parseStringPromise } from "xml2js";
import { dumpFurni } from "./dumpFurni";
import { Action } from "./state";

export async function dumpFurniFromFurniData(
  dcrUrl: string,
  furniData: string,
  folder: string,
  dispatch: (action: Action) => void
) {
  const data = await parseStringPromise(furniData);

  const furniTypes: any[] = data.furnidata.roomitemtypes[0].furnitype;
  const wallTypes: any[] = data.furnidata.wallitemtypes[0].furnitype;

  const usedIds = new Set<string>();
  const allFurni = [...wallTypes, ...furniTypes];

  dispatch({ type: "FURNI_ASSETS_COUNT", payload: allFurni.length });

  await Bluebird.map(
    allFurni,
    async (value) => {
      const name = value["$"].classname.split("*")[0];

      if (usedIds.has(name)) return;
      usedIds.add(name);

      const revision: number | undefined =
        value.revision != null ? value.revision[0] : undefined;

      try {
        await dumpFurni(dcrUrl, revision?.toString(), name, folder);
        dispatch({
          type: "FURNI_ASSETS_PROGRESS_SUCCESS",
          payload: { id: name, revision: revision?.toString() },
        });
      } catch (err) {
        //console.log(`Error dumping ${value.revision[0]}/${name}`);
        dispatch({
          type: "FURNI_ASSETS_PROGRESS_ERROR",
          payload: { id: name, revision: revision?.toString() },
        });
      }
    },
    { concurrency: 30 }
  );
}
