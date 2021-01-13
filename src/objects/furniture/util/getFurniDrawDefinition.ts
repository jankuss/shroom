import { FurniDrawDefinition, FurniDrawPart } from "./DrawDefinition";
import {
  FurnitureAnimationLayer,
  FurnitureDirectionLayer,
  IFurnitureVisualizationData,
  FurnitureLayer,
} from "../data/interfaces/IFurnitureVisualizationData";
import {
  FurnitureAsset,
  IFurnitureAssetsData,
} from "../data/interfaces/IFurnitureAssetsData";
import { getCharFromLayerIndex } from ".";

interface FurniDrawDefinitionOptions {
  type: string;
  direction: number;
  animation?: string;
}

interface FurniDrawDefinitionDependencies {
  visualizationData: IFurnitureVisualizationData;
  assetsData: IFurnitureAssetsData;
}

export function getFurniDrawDefinition(
  { type: typeWithColor, direction, animation }: FurniDrawDefinitionOptions,
  { visualizationData, assetsData }: FurniDrawDefinitionDependencies
): FurniDrawDefinition {
  const typeSplitted = typeWithColor.split("*");
  const type = typeSplitted[0];

  // If color is not  set, we fallback to the `0` color for the item.
  const color = typeSplitted[1] ?? "0";

  const size = 64;
  const parts: FurniDrawPart[] = [];
  const animationNumber = animation != null ? Number(animation) : undefined;
  const layerCount = visualizationData.getLayerCount(size);

  const getAssetName = (char: string, frame: number) =>
    `${type}_${size}_${char}_${direction}_${frame}`;

  const shadow = assetsData.getAsset(getAssetName("sd", 0));

  if (shadow != null) {
    parts.push({
      assets: [shadow],
      frameRepeat: 1,
      shadow: true,
      layer: undefined,
      layerIndex: -1,
    });
  }

  const mask = assetsData.getAsset(`${type}_${size}_${direction}_mask`);

  if (mask != null) {
    parts.push({
      assets: [mask],
      frameRepeat: 1,
      layer: undefined,
      shadow: false,
      mask: true,
      layerIndex: -2,
    });
  }

  for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
    const directionLayer = visualizationData.getDirectionLayer(
      size,
      direction,
      layerIndex
    );
    const layer = visualizationData.getLayer(size, layerIndex);
    const char = getCharFromLayerIndex(layerIndex);
    const animationLayer =
      animationNumber != null
        ? visualizationData.getAnimationLayer(size, animationNumber, layerIndex)
        : undefined;

    const colorLayer =
      color != null
        ? visualizationData.getColor(size, Number(color), layerIndex)
        : undefined;

    parts.push(
      getDrawPart({
        layer,
        directionLayer,
        animation: animationLayer,
        assetsData: assetsData,
        color: colorLayer,
        getAssetName: (frame) => getAssetName(char, frame),
        layerIndex,
      })
    );
  }

  return {
    parts,
  };
}

function getDrawPart({
  layerIndex,
  layer,
  animation,
  directionLayer,
  assetsData,
  color,
  getAssetName,
}: {
  layerIndex: number;
  layer: FurnitureLayer | undefined;
  animation: FurnitureAnimationLayer | undefined;
  directionLayer: FurnitureDirectionLayer | undefined;
  assetsData: IFurnitureAssetsData;
  color?: string;
  getAssetName: (frame: number) => string;
}): FurniDrawPart {
  const z = directionLayer?.z ?? layer?.z ?? 0;
  const x = directionLayer?.x ?? 0;
  const y = directionLayer?.y ?? 0;

  const baseAsset = assetsData.getAsset(getAssetName(0));

  let assets: FurnitureAsset[] | undefined = undefined;
  if (animation != null) {
    const repeat = 1;

    assets = animation.frames
      .flatMap((frameNumber) => new Array<number>(repeat).fill(frameNumber))
      .map(
        (frameNumber): FurnitureAsset => {
          const asset = assetsData.getAsset(getAssetName(frameNumber));

          if (asset == null)
            return { x: 0, y: 0, flipH: false, name: "unknown", valid: true };

          return {
            ...asset,
            x: asset.x + (asset.flipH ? x : -x),
            y: asset.y - y,
          };
        }
      );
  }

  if ((assets == null || assets.length === 0) && baseAsset != null) {
    assets = [baseAsset];
  }

  if (assets == null) {
    assets = [];
  }

  return {
    mask: false,
    shadow: false,
    frameRepeat: animation?.frameRepeat ?? 1,
    layer,
    z,
    tint: color,
    assets,
    loopCount: animation?.loopCount,
    layerIndex,
  };
}
