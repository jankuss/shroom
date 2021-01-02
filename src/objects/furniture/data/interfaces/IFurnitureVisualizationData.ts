export interface IFurnitureVisualizationData {
  getLayerCount(size: string): number;
  getLayers(size: string): Layer[];
  getDirections(size: string): number[];
  getDirectionLayer(
    size: string,
    direction: number,
    layerId: number
  ): DirectionLayer;
  getAnimationLayer(
    size: string,
    animationId: number,
    id: number
  ): AnimationLayer | undefined;
}

export interface Layer {
  id: number;
  z: number;
  tag?: string;
  ignoreMouse?: boolean;
  alpha?: number;
  ink?: string;
}

export interface DirectionLayer {
  z: number;
}

export interface AnimationLayer {
  frames: number[];
}
