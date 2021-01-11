import { XmlData } from "../../../data/XmlData";
import {
  FurnitureAnimationLayer,
  FurnitureDirectionLayer,
  IFurnitureVisualizationData,
  FurnitureLayer,
  Animation,
} from "./interfaces/IFurnitureVisualizationData";

export class FurnitureVisualizationData
  extends XmlData
  implements IFurnitureVisualizationData {
  constructor(xml: string) {
    super(xml);
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new FurnitureVisualizationData(text);
  }

  getTransitionForAnimation(
    size: number,
    transitionTo: number
  ): Animation | undefined {
    const animation = this.querySelector(
      `visualization[size="${size}"] animations animation[transitionTo="${transitionTo}"]`
    );

    const animationId = Number(animation?.getAttribute("id") ?? undefined);

    if (isNaN(animationId)) {
      return;
    }

    return {
      id: animationId,
      transitionTo,
    };
  }

  getAnimation(size: number, animationId: number): Animation | undefined {
    const animation = this.querySelector(
      `visualization[size="${size}"] animations animation[id="${animationId}"]`
    );

    if (animation == null) return;

    const transitionAnimationId = Number(
      animation?.getAttribute("transitionTo") ?? undefined
    );

    return {
      id: animationId,
      transitionTo: isNaN(transitionAnimationId)
        ? undefined
        : transitionAnimationId,
    };
  }

  getColor(size: number, colorId: number, layerId: number) {
    const colorElement = this.querySelector(
      `visualization[size="${size}"] colors color[id="${colorId}"] colorLayer[id="${layerId}"]`
    );

    return colorElement?.getAttribute("color") ?? undefined;
  }

  getFrameCount(size: number, animationId: number): number | undefined {
    const frameSequences = this.querySelectorAll(
      `visualization[size="${size}"] animation[id="${animationId}"] frameSequence`
    );

    let count: number | undefined;
    frameSequences.forEach((element) => {
      const parent = element.parentElement;
      const multiplier = Number(parent?.getAttribute("frameRepeat") ?? "1");

      const value = element.children.length * multiplier;

      if (count == null || value > count) {
        count = value;
      }
    });

    return count;
  }

  getAnimationLayer(
    size: number,
    animationId: number,
    id: number
  ): FurnitureAnimationLayer | undefined {
    const animationLayer = this.querySelector(
      `visualization[size="${size}"] animations animation[id="${animationId}"] animationLayer[id="${id}"]`
    );

    if (animationLayer == null) return;
    const frameRepeat = Number(
      animationLayer.getAttribute("frameRepeat") ?? undefined
    );
    const loopCount = Number(
      animationLayer.getAttribute("loopCount") ?? undefined
    );

    const frames = Array.from(
      animationLayer.querySelectorAll(`frameSequence frame`)
    );

    return {
      frames: frames.map((element) =>
        Number(element.getAttribute("id") ?? undefined)
      ),
      frameRepeat: isNaN(frameRepeat) ? undefined : frameRepeat,
      loopCount: isNaN(loopCount) ? undefined : loopCount,
    };
  }

  getDirections(size: number): number[] {
    const directions = this.querySelectorAll(
      `visualization[size="${size}"] directions direction`
    );

    return directions.map((element) => {
      const id = element.getAttribute("id") ?? undefined;

      return Number(id);
    });
  }

  getDirectionLayer(
    size: number,
    direction: number,
    layerId: number
  ): FurnitureDirectionLayer | undefined {
    const directionLayer = this.querySelector(
      `visualization[size="${size}"] directions direction[id="${direction}"] layer[id="${layerId}"]`
    );

    if (directionLayer == null) return;
    const directionZ = Number(directionLayer.getAttribute("z") ?? undefined);

    if (isNaN(directionZ)) return;

    return {
      z: directionZ,
    };
  }

  getLayerCount(size: number) {
    const visualization = this.querySelector(`visualization[size="${size}"]`);
    if (visualization == null) throw new Error("Invalid visualization");

    return Number(visualization.getAttribute("layerCount") ?? undefined);
  }

  getLayer(size: number, layerId: number): FurnitureLayer | undefined {
    const layerElement = this.querySelector(
      `visualization[size="${size}"] layers layer[id="${layerId}"]`
    );

    if (layerElement == null) return;

    const id = layerElement.getAttribute("id") ?? undefined;
    const z = layerElement.getAttribute("z") ?? undefined;
    const tag = layerElement.getAttribute("tag") ?? undefined;
    const alpha = layerElement.getAttribute("alpha") ?? undefined;
    const ink = layerElement.getAttribute("ink") ?? undefined;
    const ignoreMouse = layerElement.getAttribute("ignoreMouse") ?? undefined;

    const idNumber = Number(id);
    const zNumber = Number(z);
    const alphaNumber = Number(alpha);

    if (isNaN(idNumber)) throw new Error("Invalid layer id");

    return {
      id: idNumber,
      z: isNaN(zNumber) ? 0 : zNumber,
      alpha: isNaN(alphaNumber) ? undefined : alphaNumber,
      tag: tag ?? undefined,
      ink: ink ?? undefined,
      ignoreMouse: ignoreMouse != null ? ignoreMouse === "1" : undefined,
    };
  }
}
