import {
  OffsetMap,
  parseOffsetsFromManifest,
} from "./parseOffsetsFromManifest";
import { parseStringAsync } from "./parseStringAsync";

export type GetOffset = (
  fileName: string
) => { offsetX: number; offsetY: number } | undefined;

export async function loadOffsetMap(
  figureMap: string[],
  getManifest: (fileName: string) => Promise<string>
): Promise<{
  getOffset: GetOffset;
  offsetMap: Map<string, { offsetX: number; offsetY: number }>;
}> {
  const offsetMap: OffsetMap = new Map();
  for (let i = 0; i < figureMap.length; i++) {
    const fileName = figureMap[i];

    try {
      const manifestStr = await getManifest(fileName);

      const manifestXml = await parseStringAsync(manifestStr);

      const offsets = parseOffsetsFromManifest(manifestXml);
      offsets.forEach((offset, key) => offsetMap.set(key, offset));
    } catch (e) {
      continue;
    }
  }

  return {
    getOffset: (name) => offsetMap.get(name),
    offsetMap,
  };
}
