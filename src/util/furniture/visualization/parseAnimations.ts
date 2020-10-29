import { VisualizationXmlVisualization } from "./VisualizationXml";

export function parseAnimations(
  visualization: VisualizationXmlVisualization,
  set: (id: string, animation: AnimationData) => void
) {
  const animations = visualization.animations
    ? visualization.animations[0].animation
    : undefined;

  if (animations != null) {
    animations.forEach((animation) => {
      const animationId = animation["$"].id;

      const animationLayers = animation.animationLayer;

      const layerToFrames = new Map<
        string,
        { frames: string[]; frameRepeat?: number }
      >();

      let frameCount = 1;

      animationLayers.forEach((layer) => {
        const layerId = layer["$"].id;

        if (layer.frameSequence != null) {
          const frameSequenceFrames = layer.frameSequence[0].frame;

          const frames = frameSequenceFrames.map((frame) => frame["$"].id);
          const frameRepeatString = layer["$"].frameRepeat;

          layerToFrames.set(layerId, {
            frames,
            frameRepeat:
              frameRepeatString != null ? Number(frameRepeatString) : undefined,
          });

          if (frames.length > frameCount) {
            frameCount = frames.length;
          }
        }
      });

      set(animationId, {
        frameCount: frameCount,
        layerToFrames,
      });
    });
  }
}

export type FramesData = {
  frames: string[];
  frameRepeat?: number;
};

export type AnimationData = {
  frameCount: number;
  layerToFrames: Map<string, FramesData>;
};
