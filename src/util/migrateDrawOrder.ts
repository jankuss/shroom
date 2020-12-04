import { promises as fs } from "fs";
import { parseStringPromise } from "xml2js";

export async function migrateDrawOrder() {
  const drawOrderBuffer = await fs.readFile(`./resources/draworder.xml`);
  const drawOrderString = drawOrderBuffer.toString("utf-8");
  const parsed = await parseStringPromise(drawOrderString);

  const obj: any = {};
  const actions: any[] = parsed.actionSet.action;

  actions.forEach((value) => {
    const actionId = value["$"].id;
    const directions: any[] = value.direction;

    const directionObj: any = {};

    directions.forEach((value) => {
      const directionId = value["$"].id;

      const parts: any[] = value.partList[0].part;
      const sets = parts.map((value) => value["$"]["set-type"]);
      directionObj[directionId] = sets;
    });

    obj[actionId] = directionObj;
  });

  console.log("OBJ", obj);
}

migrateDrawOrder().catch(console.error);
