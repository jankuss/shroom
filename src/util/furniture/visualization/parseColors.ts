import { VisualizationXmlVisualization } from "./VisualizationXml";

export function parseColors(
  visualization: VisualizationXmlVisualization,
  set: (id: string, colorLayersMap: Map<string, string>) => void
) {
  const colors = visualization.colors && visualization.colors[0].color;

  if (colors != null) {
    colors.forEach(color => {
      const id = color["$"].id;
      const colorLayersMap = new Map<string, string>();
      const colorLayers = color.colorLayer;

      colorLayers.forEach(layer => {
        const layerId = layer["$"].id;
        const color = layer["$"].color;

        colorLayersMap.set(layerId, color);
      });

      set(id, colorLayersMap);
    });
  }
}
