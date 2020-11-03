export interface IRoomVisualization {
  addPlaneChild(element: PIXI.DisplayObject): void;
  addContainerChild(element: PIXI.DisplayObject): void;
  addMask(element: PIXI.DisplayObject): void;
}
