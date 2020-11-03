import { Asset } from "./parseAssets";
import { Layer } from "./visualization/parseLayers";

export type DrawPart = {
  z?: number;
  shadow: boolean;
  frameRepeat: number;
  asset: Asset | undefined;
  layer: Layer | undefined;
  tint?: string;
  assets?: Asset[];
  mask?: boolean;
};

export interface DrawDefinition {
  parts: DrawPart[];
  frameCount?: number;
}
