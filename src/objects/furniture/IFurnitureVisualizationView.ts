import { IFurnitureVisualizationData } from "./data/interfaces/IFurnitureVisualizationData";

/**
 * This is a intermediary interface injected into the visualization
 * of a furniture (e.g. `AnimatedFurnitureVisualization`). This interface exposes
 * all the necessary methods to manipulate the way the furniture displays on the screen.
 */
export interface IFurnitureVisualizationView {
  /**
   * Sets the displaying animation of the furniture.
   * @param animation
   */
  setDisplayAnimation(animation?: string): void;

  /**
   * Sets the displaying direction of the furniture.
   * @param direction
   */
  setDisplayDirection(direction: number): void;

  /**
   * Updates the furniture display with the previously set animation and direction.
   */
  updateDisplay(): void;

  /**
   * Gets the display layers of the furniture.
   * This can only be called after `updateDisplay` has been called.
   */
  getLayers(): IFurnitureVisualizationLayer[];

  /**
   * Gets the visualization data of the furniture.
   */
  getVisualizationData(): IFurnitureVisualizationData;
}

export interface IFurnitureVisualizationLayer {
  tag?: string;
  /**
   * How often frames are repeated
   */
  frameRepeat: number;
  /**
   * The layer index specified as a number.
   * a = 0
   * b = 1
   * c = 2
   *
   * etc.
   */
  layerIndex: number;
  /**
   * The amount of frames for this layer
   */
  assetCount: number;
  /**
   * Sets the active frame to display for this layer
   * @param frame
   */
  setCurrentFrameIndex(frame: number): void;
  setColor(color: number): void;
}
