import { parseStringAsync } from "./parseStringAsync";
import { parseDrawOrder } from "./parseDrawOrder";
import { parseFigureData } from "./parseFigureData";
import { parseFigureMap } from "./parseFigureMap";
import { GetOffset } from "./loadOffsetMap";
import {
  getAvatarDrawDefinition,
  AvatarDrawDefinition,
  PrimaryAction,
  SecondaryActions,
} from "./getAvatarDrawDefinition";
import { parseLookString } from "./parseLookString";

export interface LookOptions {
  look: string;
  action: PrimaryAction;
  actions: SecondaryActions;
  direction: number;
}

export interface LookServer {
  (options: LookOptions): AvatarDrawDefinition | undefined;
}

export async function createLookServer({
  figureDataString,
  figureMapString,
  loadOffsetMap,
}: {
  figureMapString: string;
  figureDataString: string;
  loadOffsetMap: (figureMap: string[]) => Promise<GetOffset>;
}): Promise<LookServer> {
  const figureDataXml = await parseStringAsync(figureDataString);
  const figureMapXml = await parseStringAsync(figureMapString);

  const { getSetType } = parseFigureData(figureDataXml);
  const figureMap = parseFigureMap(figureMapXml);

  const getOffset = await loadOffsetMap(figureMap.libraries);

  return ({ look, action, actions, direction }: LookOptions) =>
    getAvatarDrawDefinition(
      {
        parsedLook: parseLookString(look),
        action: action,
        actions: actions,
        direction,
      },
      { getOffset, getSetType, getLibraryOfPart: figureMap.getLibraryOfPart }
    );
}
