import { Layer } from "./parseLayers";
import { VisualizationXmlVisualization } from "./VisualizationXml";

export function parseDirections(
  visualization: VisualizationXmlVisualization,
  set: (direction: number, layerMap: Map<string, Layer>) => void
) {
  const directions = visualization.directions[0].direction;
  const validDirections: number[] = [];

  for (let i = 0; i < directions.length; i++) {
    const layerMap = new Map<string, Layer>();

    const directionNumber = Number(directions[i]["$"].id);
    const directionLayers = directions[i].layer || [];

    validDirections.push(directionNumber);

    for (let j = 0; j < directionLayers.length; j++) {
      const layer = directionLayers[j]["$"];

      layerMap.set(layer.id, {
        zIndex: layer != null && layer.z != null ? Number(layer.z) : undefined,
        tag: undefined,
        ink: undefined,
        alpha: undefined,
        ignoreMouse: undefined,
      });
    }

    set(directionNumber, layerMap);
  }

  return {
    validDirections,
  };
}
