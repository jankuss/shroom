import { loadOffsetMap } from "./loadOffsetMap";
import * as fs from "fs";
import { parseStringAsync } from "./parseStringAsync";
import { parseFigureMap } from "./parseFigureMap";

export async function createOffsetSnapshot(
  figureMapStr: string,
  getManifest: (fileName: string) => Promise<string>
) {
  const figureMapXml = await parseStringAsync(figureMapStr);
  const figureMap = parseFigureMap(figureMapXml);

  const { offsetMap } = await loadOffsetMap(figureMap, getManifest);

  const result = JSON.stringify(Object.fromEntries(offsetMap));

  return result;
}
