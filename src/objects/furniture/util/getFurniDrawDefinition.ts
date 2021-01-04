import { Visualization } from "./visualization/parseVisualization";
import { AssetMap } from "./parseAssets";
import { FurniDrawDefinition, FurniDrawPart } from "./DrawDefinition";
import { layerToChar } from "./index";
import { FramesData } from "./visualization/parseAnimations";
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
  const color = typeSplitted[1];

  const size = 64;
  const parts: FurniDrawPart[] = [];
  const animationNumber = animation != null ? Number(animation) : undefined;

  const frameCount =
    animationNumber != null
      ? visualizationData.getFrameCount(size, animationNumber)
      : 1;

  const layerCount = visualizationData.getLayerCount(size);

  const animationData =
    animationNumber != null
      ? visualizationData.getAnimation(size, animationNumber)
      : undefined;

  const getAssetName = (char: string, frame: number) =>
    `${type}_${size}_${char}_${direction}_${frame}`;

  for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
    const directionLayer = visualizationData.getDirectionLayer(
      size,
      direction,
      layerIndex
    );
    const layer = visualizationData.getLayer(size, layerIndex);
    const char = layerToChar[layerIndex];
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
      })
    );
  }

  parts.push({
    asset: assetsData.getAsset(getAssetName("sd", 0)),
    frameRepeat: 1,
    shadow: true,
    layer: undefined,
  });

  const mask = assetsData.getAsset(`${type}_${size}_${direction}_mask`);

  if (mask != null) {
    parts.push({
      asset: mask,
      frameRepeat: 1,
      layer: undefined,
      shadow: false,
      mask: true,
    });
  }

  return {
    parts,
    frameCount,
    transitionTo: animationData?.transitionTo,
  };
}

function getDrawPart({
  layer,
  animation,
  directionLayer,
  assetsData,
  color,
  getAssetName,
}: {
  layer: FurnitureLayer | undefined;
  animation: FurnitureAnimationLayer | undefined;
  directionLayer: FurnitureDirectionLayer | undefined;
  assetsData: IFurnitureAssetsData;
  color?: string;
  getAssetName: (frame: number) => string;
}): FurniDrawPart {
  const z = directionLayer?.z ?? layer?.z ?? 0;

  const baseAsset = assetsData.getAsset(getAssetName(0));

  let assets: FurnitureAsset[] | undefined = undefined;
  if (animation != null) {
    const repeat = animation.frameRepeat ?? 1;

    assets = animation.frames
      .flatMap((frameNumber) => new Array<number>(repeat).fill(frameNumber))
      .map(
        (frameNumber): FurnitureAsset => {
          const asset = assetsData.getAsset(getAssetName(frameNumber));

          if (asset == null)
            return { x: 0, y: 0, flipH: false, name: "unknown", valid: true };

          return asset;
        }
      );
  }

  if ((assets == null || assets.length === 0) && baseAsset != null) {
    assets = [baseAsset];
  }

  return {
    mask: false,
    shadow: false,
    frameRepeat: animation?.frameRepeat ?? 1,
    asset: baseAsset,
    layer,
    z,
    tint: color,
    assets,
    loopCount: animation?.loopCount,
  };
}
