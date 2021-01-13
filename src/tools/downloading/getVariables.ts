import { parseExternalVariables } from "./parseExternalVariables";

import fetch from "node-fetch";

export async function getVariables(externalVariablesUrl: string) {
  const externalVariablesString = await fetch(
    externalVariablesUrl
  ).then((res) => res.text());
  const parsed = await parseExternalVariables(externalVariablesString);
  const figureMapUrl = parsed.get(
    "flash.dynamic.avatar.download.configuration"
  );

  const figureDataUrl = parsed.get("external.figurepartlist.txt");

  const hofFurniUrl = parsed.get("dynamic.download.url");

  const furniDataUrl = parsed.get("furnidata.load.url");

  if (figureMapUrl == null) throw new Error("Invalid figure map url");
  if (hofFurniUrl == null) throw new Error("Invalid hof_furni url");
  if (figureDataUrl == null) throw new Error("Invalid figure data url");
  if (furniDataUrl == null) throw new Error("Invalid furni data url");

  return {
    figureMapUrl,
    hofFurniUrl,
    figureDataUrl,
    furniDataUrl,
  };
}
