import { parseStringAsync } from "./parseStringAsync";
import { parseDrawOrder } from "./parseDrawOrder";
import { parseFigureData } from "./parseFigureData";
import { parseFigureMap } from "./parseFigureMap";
import { GetOffset } from "./loadOffsetMap";
import {
  getAvatarDrawDefinition,
  AvatarDrawDefinition,
  AvatarDependencies,
} from "./getAvatarDrawDefinition";
import { parseLookString } from "./parseLookString";
import { AvatarAction } from "./AvatarAction";

export interface LookOptions {
  look: string;
  actions: Set<AvatarAction>;
  direction: number;
}

export interface LookServer {
  (options: LookOptions): AvatarDrawDefinition | undefined;
}

export async function createLookServer(
  dependencies: AvatarDependencies
): Promise<LookServer> {
  return ({ look, actions, direction }: LookOptions) =>
    getAvatarDrawDefinition(
      {
        parsedLook: parseLookString(look),
        actions,
        direction,
        frame: 0,
      },
      dependencies
    );
}
