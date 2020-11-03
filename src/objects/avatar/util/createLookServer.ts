import { parseStringAsync } from "./parseStringAsync";
import { parseDrawOrder } from "./parseDrawOrder";
import { parseFigureData } from "./parseFigureData";
import { parseFigureMap } from "./parseFigureMap";
import { GetOffset } from "./loadOffsetMap";
import {
  getAvatarDrawDefinition,
  AvatarDrawDefinition,
} from "./getAvatarDrawDefinition";
import { parseLookString } from "./parseLookString";

export interface LookServer {
  (look: string, action: string, direction: number, frame: number):
    | AvatarDrawDefinition
    | undefined;
}

export async function createLookServer({
  figureDataString,
  figureMapString,
  drawOrderString,
  loadOffsetMap,
}: {
  figureMapString: string;
  figureDataString: string;
  drawOrderString: string;
  loadOffsetMap: (figureMap: string[]) => Promise<GetOffset>;
}): Promise<LookServer> {
  const figureDataXml = await parseStringAsync(figureDataString);
  const drawOrderXml = await parseStringAsync(drawOrderString);
  const figureMapXml = await parseStringAsync(figureMapString);

  const { getDrawOrder } = parseDrawOrder(drawOrderXml);
  const { getSetType } = parseFigureData(figureDataXml);
  const figureMap = parseFigureMap(figureMapXml);

  const getOffset = await loadOffsetMap(figureMap);

  return (look: string, action: string, direction: number, frame: number) =>
    getAvatarDrawDefinition(
      { parsedLook: parseLookString(look), action: action, direction, frame },
      { getDrawOrder, getOffset, getSetType }
    );
}
