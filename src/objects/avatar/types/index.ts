import { IAvatarActionsData } from "../data/interfaces/IAvatarActionsData";
import { IAvatarAnimationData } from "../data/interfaces/IAvatarAnimationData";
import { IAvatarGeometryData } from "../data/interfaces/IAvatarGeometryData";
import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";
import { IAvatarPartSetsData } from "../data/interfaces/IAvatarPartSetsData";
import { IFigureData } from "../data/interfaces/IFigureData";
import { IFigureMapData } from "../data/interfaces/IFigureMapData";

export type AvatarAsset = {
  fileId: string;
  x: number;
  y: number;
  library: string;
  mirror: boolean;
  substractWidth?: boolean;
};

export type AvatarDrawPart = DefaultAvatarDrawPart | AvatarEffectDrawPart;

export type DefaultAvatarDrawPart = {
  kind: "AVATAR_DRAW_PART";
  type: string;
  index: number;
  mode: "colored" | "just-image";
  color: string | undefined;
  assets: AvatarAsset[];
  z: number;
};

export type AvatarEffectDrawPart = {
  kind: "EFFECT_DRAW_PART";
  assets: AvatarAsset[];
  z: number;
  ink?: number;
  addition: boolean;
};

export interface AvatarDependencies extends AvatarExternalDependencies {
  offsetsData: IAvatarOffsetsData;
}

export interface AvatarExternalDependencies {
  figureData: IFigureData;
  figureMap: IFigureMapData;
  animationData: IAvatarAnimationData;
  partSetsData: IAvatarPartSetsData;
  geometry: IAvatarGeometryData;
  actionsData: IAvatarActionsData;
}
