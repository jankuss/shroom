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
  item?: string | number;
}

export interface LookServer {
  (options: LookOptions): AvatarDrawDefinition | undefined;
}

export async function createLookServer(
  dependencies: AvatarDependencies
): Promise<LookServer> {
  return ({ look, actions, direction, item }: LookOptions) =>
    getAvatarDrawDefinition(
      {
        parsedLook: parseLookString(look),
        actions,
        direction,
        frame: 0,
        item: item,
      },
      dependencies
    );
}
