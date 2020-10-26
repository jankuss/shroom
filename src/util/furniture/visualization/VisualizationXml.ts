export type VisualizationXml = {
  visualizationData: {
    graphics: {
      visualization: VisualizationXmlVisualization[];
    }[];
  };
};

export type VisualizationXmlVisualization = {
  $: { size: string; layerCount: string };
  layers:
    | {
        layer: {
          $: {
            id: string;
            z: string | undefined;
            ink: string | undefined;
            tag: string | undefined;
            ignoreMouse: string | undefined;
            alpha: string | undefined;
          };
        }[];
      }[]
    | undefined;

  directions: {
    direction: {
      $: { id: string };
      layer:
        | {
            $: {
              id: string;
              z: string | undefined;
              ink: string | undefined;
              tag: string | undefined;
            };
          }[]
        | undefined;
    }[];
  }[];

  colors:
    | {
        color: {
          $: {
            id: string;
          };
          colorLayer: {
            $: {
              id: string;
              color: string;
            };
          }[];
        }[];
      }[]
    | undefined;

  animations:
    | {
        animation: {
          $: { id: string };
          animationLayer: {
            $: { id: string; frameRepeat: string | undefined };
            frameSequence: {
              frame: {
                $: {
                  id: string;
                };
              }[];
            }[];
          }[];
        }[];
      }[]
    | undefined;
};
