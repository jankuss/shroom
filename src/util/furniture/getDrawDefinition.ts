import { Visualization } from "./visualization/parseVisualization";
import { AssetMap } from "./parseAssets";
import { DrawDefinition, DrawPart } from "./DrawDefinition";
import { layerToChar } from "./index";
import { FramesData } from "./visualization/parseAnimations";

export function getDrawDefinition({
  type: typeWithColor,
  direction,
  visualization,
  assetMap,
  animation,
}: {
  type: string;
  direction: number;
  visualization: Visualization;
  assetMap: AssetMap;
  animation?: string;
}): DrawDefinition {
  const typeSplitted = typeWithColor.split("*");
  const type = typeSplitted[0];
  const color = typeSplitted[1];

  const size = 64;
  const parts: DrawPart[] = [];

  const animationFrameCount =
    animation != null ? visualization.getFrameCount(animation) : undefined;
  const frameCount = animationFrameCount != null ? animationFrameCount : 1;

  const getAsset = (char: string, layerIndex: number): DrawPart | undefined => {
    const frameInfo = animation
      ? visualization.getAnimation(animation, layerIndex.toString())
      : undefined;

    const frameRepeat = frameInfo?.frameRepeat ?? 1;

    const getAssetName = (frame: string) =>
      `${type}_${size}_${char}_${direction}_${frame}`;
    const asset = assetMap.get(getAssetName("0"));

    const assets = frameInfo?.frames
      .flatMap((frame) => Array<string>(frameRepeat).fill(frame))
      .map((frame) => getAssetName(frame))
      .map((id) => {
        const asset = assetMap.get(id);
        if (asset == null) throw new Error("Invalid asset");

        return asset;
      });

    const layer = visualization.getLayer(layerIndex.toString());
    const layerOverride = visualization.getDirectionLayerOverride(
      direction,
      layerIndex.toString()
    );
    const layerColor = visualization.getColor(
      color ?? "0",
      layerIndex.toString()
    );

    const actualLayer = layerOverride || layer;

    return {
      z: actualLayer != null ? actualLayer.zIndex : undefined,
      shadow: char === "sd",
      frameRepeat,
      tint: layerColor,
      layer,
      asset,
      assets,
    };
  };

  const shadow = getAsset("sd", -1);

  if (shadow != null) {
    parts.push(shadow);
  }

  for (let i = 0; i < visualization.layerCount; i++) {
    const asset = getAsset(layerToChar[i], i);

    if (!asset) continue;

    parts.push(asset);
  }

  return {
    parts,
    frameCount,
  };
}

function getDisplayFrame(
  framesInfo: FramesData | undefined,
  nonNormalizedFrame: number,
  frameCount: number
) {
  let displayFrame = "0";
  let frameRepeat: number = 1;

  if (framesInfo != null) {
    const { frames, frameRepeat: actualFrameRepeat } = framesInfo;

    if (actualFrameRepeat != null) {
      frameRepeat = actualFrameRepeat;
    }

    const frame = nonNormalizedFrame % (frameCount * frameRepeat);

    const repeatedFrames = frames.flatMap((frame) =>
      Array<string>(frameRepeat).fill(frame)
    );

    displayFrame = repeatedFrames[frame];

    for (let i = 0; i < frame; i++) {
      const current = repeatedFrames[i];
      const next = repeatedFrames[i + 1];

      if (next == null) {
        displayFrame = current;
        break;
      }
    }
  }

  return {
    frameRepeat,
    displayFrame,
  };
}
