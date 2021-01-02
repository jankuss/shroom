export interface IFurnitureVisualizationData {
  getLayerCount(size: number): number;
  getLayer(size: number, layerId: number): FurnitureLayer | undefined;
  getDirections(size: number): number[];
  getDirectionLayer(
    size: number,
    direction: number,
    layerId: number
  ): FurnitureDirectionLayer | undefined;
  getAnimationLayer(
    size: number,
    animationId: number,
    id: number
  ): FurnitureAnimationLayer | undefined;
  getFrameCount(size: number, animationId: number): number | undefined;
  getColor(size: number, colorId: number, layerId: number): string | undefined;
  getAnimation(size: number, animationId: number): Animation | undefined;
}

export interface Animation {
  transitionTo?: number;
}

export interface FurnitureLayer {
  id: number;
  z: number;
  tag?: string;
  ignoreMouse?: boolean;
  alpha?: number;
  ink?: string;
}

export interface FurnitureDirectionLayer {
  z: number;
}

export interface FurnitureAnimationLayer {
  frames: number[];
  frameRepeat?: number;
  random?: boolean;
  loopCount?: number;
}
