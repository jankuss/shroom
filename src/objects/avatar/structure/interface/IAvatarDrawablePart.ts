import { AvatarDrawPart } from "../../types";

export interface IAvatarDrawablePart {
  getDrawDefinition(): AvatarDrawPart | undefined;
}
