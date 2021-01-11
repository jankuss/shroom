import { parseStringPromise } from "xml2js";
import { loadOffsetMap } from "./loadOffsetMap";
import { parseFigureMap } from "./parseFigureMap";

export async function createOffsetSnapshot(
  figureMapStr: string,
  getManifest: (fileName: string) => Promise<string>
) {
  const figureMapXml = await parseStringPromise(figureMapStr);
  const figureMap = parseFigureMap(figureMapXml);

  const { offsetMap } = await loadOffsetMap(figureMap.libraries, getManifest);

  const obj: any = {};

  offsetMap.forEach((value, key) => (obj[key] = value));

  const result = JSON.stringify(obj);

  return result;
}
