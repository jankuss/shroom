import { FurnitureVisualizationJson } from "./FurnitureVisualizationJson";
import {
  FurnitureAnimation,
  FurnitureAnimationLayer,
  FurnitureDirectionLayer,
  FurnitureLayer,
  IFurnitureVisualizationData,
} from "./interfaces/IFurnitureVisualizationData";

export class JsonFurnitureVisualizationData
  implements IFurnitureVisualizationData {
  constructor(private _furniture: FurnitureVisualizationJson) {}

  getLayerCount(size: number): number {
    return this._getVisualization(size).layerCount;
  }

  getLayer(size: number, layerId: number): FurnitureLayer | undefined {
    return this._getVisualization(size).layers[layerId.toString()];
  }

  getDirections(size: number): number[] {
    return Object.keys(
      this._getVisualization(size).directions
    ).map((direction) => Number(direction));
  }

  getDirectionLayer(
    size: number,
    direction: number,
    layerId: number
  ): FurnitureDirectionLayer | undefined {
    return this._getVisualization(size).directions[direction.toString()]
      ?.layers[layerId.toString()];
  }

  getAnimationLayer(
    size: number,
    animationId: number,
    id: number
  ): FurnitureAnimationLayer | undefined {
    return this._getVisualization(size).animations[animationId.toString()]
      ?.layers[id.toString()];
  }

  getFrameCountWithoutRepeat(
    size: number,
    animationId: number
  ): number | undefined {
    let count = 1;

    Object.values(
      this._getVisualization(size).animations[animationId.toString()] ?? {}
    ).forEach((layers) => {
      Object.values(layers ?? {}).forEach((layer) => {
        const frameCount = layer?.frames.length ?? 0;

        const value = frameCount;
        if (value > count) {
          count = value;
        }
      });
    });

    return count;
  }

  getFrameCount(size: number, animationId: number): number | undefined {
    let count = 1;

    Object.values(
      this._getVisualization(size).animations[animationId.toString()] ?? {}
    ).forEach((layers) => {
      Object.values(layers ?? {}).forEach((layer) => {
        const frameCount = layer?.frames.length ?? 0;
        const multiplier = layer?.frameRepeat ?? 1;

        const value = frameCount * multiplier;
        if (value > count) {
          count = value;
        }
      });
    });

    return count;
  }

  getColor(size: number, colorId: number, layerId: number): string | undefined {
    return this._getVisualization(size).colors[colorId.toString()]?.layers[
      layerId.toString()
    ]?.color;
  }

  getAnimation(
    size: number,
    animationId: number
  ): FurnitureAnimation | undefined {
    const animation = this._getVisualization(size).animations[
      animationId.toString()
    ];

    if (animation != null) {
      return {
        transitionTo: animation.transitionTo,
        id: animationId,
      };
    }
  }

  getTransitionForAnimation(
    size: number,
    transitionTo: number
  ): FurnitureAnimation | undefined {
    const animations = Object.entries(this._getVisualization(size).animations);

    const animationTransitionTo = animations.find(
      ([id, animation]) => animation?.transitionTo === transitionTo
    );

    if (animationTransitionTo != null) {
      const animationId = Number(animationTransitionTo[0]);

      return {
        id: animationId,
        transitionTo,
      };
    }
  }

  private _getVisualization(size: number) {
    const visualization = this._furniture[size.toString()];

    if (visualization == null) {
      throw new Error("Invalid visualization");
    }

    return visualization;
  }
}
