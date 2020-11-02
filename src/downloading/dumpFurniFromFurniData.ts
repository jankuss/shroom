import Bluebird = require("bluebird");
import { parseStringPromise } from "xml2js";
import { dumpFurni } from "./dumpFurni";

export async function dumpFurniFromFurniData(
  dcrUrl: string,
  furniData: string,
  folder: string
) {
  const data = await parseStringPromise(furniData);

  const furniTypes: any[] = data.furnidata.roomitemtypes[0].furnitype;
  const wallTypes: any[] = data.furnidata.wallitemtypes[0].furnitype;

  const usedIds = new Set<string>();

  await Bluebird.map(
    [...wallTypes],
    async (value) => {
      const name = value["$"].classname.split("*")[0];

      if (usedIds.has(name)) return;
      usedIds.add(name);

      try {
        await dumpFurni(dcrUrl, value.revision[0], name, folder);
        console.log("Dumped", name);
      } catch (err) {
        console.log(`Error dumping ${value.revision[0]}/${name}`);
      }
    },
    { concurrency: 30 }
  );
}
