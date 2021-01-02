import { XmlData } from "../../../data/XmlData";
import {
  AnimationLayer,
  DirectionLayer,
  IFurnitureVisualizationData,
  Layer,
} from "./interfaces/IFurnitureVisualizationData";

export class FurnitureVisualizationData
  extends XmlData
  implements IFurnitureVisualizationData {
  constructor(xml: string) {
    super(xml);
  }

  getAnimationLayer(
    size: string,
    animationId: number,
    id: number
  ): AnimationLayer | undefined {
    const animationLayer = this.querySelector(
      `visualization[size="${size}"] animations animation[id="${animationId}"] animationLayer[id="${id}"]`
    );

    if (animationLayer == null) return;

    const frames = Array.from(
      animationLayer.querySelectorAll(`frameSequence frame`)
    );

    return {
      frames: frames.map((element) => Number(element.getAttribute("id"))),
    };
  }

  getDirections(size: string): number[] {
    const directions = this.querySelectorAll(
      `visualization[size="${size}"] directions direction`
    );

    return directions.map((element) => {
      const id = element.getAttribute("id");

      return Number(id);
    });
  }

  getDirectionLayer(
    size: string,
    direction: number,
    layerId: number
  ): DirectionLayer {
    const directionLayer = this.querySelector(
      `visualization[size="${size}"] directions direction[id="${direction}"] layer[id="${layerId}"]`
    );

    return {
      z: Number(directionLayer?.getAttribute("z")),
    };
  }

  getLayerCount(size: string) {
    const visualization = this.querySelector(`visualization[size="${size}"]`);
    if (visualization == null) throw new Error("Invalid visualization");

    return Number(visualization.getAttribute("layerCount"));
  }

  getLayers(size: string): Layer[] {
    const layers = this.querySelectorAll(
      `visualization[size="${size}"] layers layer`
    );

    return layers.map(
      (layerElement): Layer => {
        const id = layerElement.getAttribute("id");
        const z = layerElement.getAttribute("z");
        const tag = layerElement.getAttribute("tag");
        const alpha = layerElement.getAttribute("alpha");
        const ink = layerElement.getAttribute("ink");
        const ignoreMouse = layerElement.getAttribute("ignoreMouse");

        const idNumber = Number(id);
        const zNumber = Number(z);
        const alphaNumber = Number(alpha);

        return {
          id: idNumber,
          z: zNumber,
          alpha: isNaN(alphaNumber) ? undefined : alphaNumber,
          tag: tag ?? undefined,
          ink: ink ?? undefined,
          ignoreMouse: ignoreMouse != null ? ignoreMouse === "1" : undefined,
        };
      }
    );
  }
}
