import { AvatarDrawPart } from "../util/getAvatarDrawDefinition";

export interface IAvatarDrawablePart {
  getDrawDefinition(): AvatarDrawPart | undefined;
}
