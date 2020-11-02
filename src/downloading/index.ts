import { promises as fs } from "fs";
import * as path from "path";
import fetch from "node-fetch";
import * as url from "url";

import { getVariables } from "./getVariables";
import { dumpFigureLibraries } from "./dumpFigureLibraries";
import { tryFetchString } from "./fetching";
import { dumpFurniFromFurniData } from "./dumpFurniFromFurniData";

async function main() {
  const {
    figureMapUrl,
    figureDataUrl,
    furniDataUrl,
    hofFurniUrl,
  } = await getVariables(
    "https://www.habbo.com/gamedata/external_variables/29fd8c5448063b72a92ecdc258c6395c61dcd91f"
  );

  const libraryFolder = "./resources";

  await fs.mkdir(libraryFolder, { recursive: true });

  const figureMapString = await tryFetchString(makeAbsolute(figureMapUrl));

  await fs.writeFile(
    path.join(libraryFolder, "figuremap.xml"),
    figureMapString
  );

  await fs.writeFile(
    path.join(libraryFolder, "figuredata.xml"),
    await tryFetchString(makeAbsolute(figureDataUrl))
  );

  const furniData = await tryFetchString(makeAbsolute(furniDataUrl));

  await fs.writeFile(path.join(libraryFolder, "furnidata.xml"), furniData);

  const gordonUrl = figureMapUrl.split("/").slice(0, -1).join("/");

  const figureFolder = path.join(libraryFolder, "figure");
  await fs.mkdir(figureFolder, { recursive: true });

  const furniFolder = path.join(libraryFolder, "hof_furni");
  await fs.mkdir(furniFolder, { recursive: true });

  await dumpFurniFromFurniData(hofFurniUrl, furniData, furniFolder);

  await dumpFigureLibraries(
    makeAbsolute(gordonUrl),
    figureMapString,
    figureFolder
  );
}

function makeAbsolute(url: string) {
  if (url.slice(0, 2) === "//") {
    return `http:${url}`;
  }

  return url;
}

main();
