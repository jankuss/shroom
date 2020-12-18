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
  action: AvatarAction;
  direction: number;
}

export interface LookServer {
  (options: LookOptions): AvatarDrawDefinition | undefined;
}

export async function createLookServer(
  dependencies: AvatarDependencies
): Promise<LookServer> {
  return ({ look, action, direction }: LookOptions) =>
    getAvatarDrawDefinition(
      {
        parsedLook: parseLookString(look),
        action: action,
        direction,
        frame: 0,
      },
      dependencies
    );
}
