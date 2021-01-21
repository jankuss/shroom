import { parseExternalVariables } from "./parseExternalVariables";

import fetch from "node-fetch";

export async function getExternalVariableUrls(
  externalVariablesUrl: string
): Promise<ExternalVariables> {
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

  const gordonUrl = figureMapUrl.split("/").slice(0, -1).join("/");

  return {
    figureMapUrl,
    hofFurniUrl,
    figureDataUrl,
    furniDataUrl,
    gordonUrl,
  };
}

export interface ExternalVariables {
  figureMapUrl: string;
  hofFurniUrl: string;
  figureDataUrl: string;
  furniDataUrl: string;
  gordonUrl: string;
}
