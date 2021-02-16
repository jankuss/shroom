import { mock } from "../../../../util/mock";
import { IFurnitureVisualizationData } from "../../data/interfaces/IFurnitureVisualizationData";
import {
  IFurnitureVisualizationLayer,
  IFurnitureVisualizationView,
} from "../../IFurnitureVisualizationView";
import { StaticFurnitureVisualization } from "../BasicFurnitureVisualization";

test("sets direction", () => {
  const visu = new StaticFurnitureVisualization();

  const layer: IFurnitureVisualizationLayer = {
    assetCount: 4,
    layerIndex: 0,
    frameRepeat: 1,
    setCurrentFrameIndex: jest.fn(),
    setColor: jest.fn(),
  };

  const visualizationData = mock<IFurnitureVisualizationData>({
    getTransitionForAnimation: jest.fn().mockReturnValue(undefined),
    getAnimation: jest.fn().mockReturnValue({ id: 1 }),
    getFrameCount: jest.fn().mockReturnValue(4),
  });

  const view = mock<IFurnitureVisualizationView>({
    getLayers: jest.fn().mockReturnValue([layer]),
    getVisualizationData: jest.fn().mockReturnValue(visualizationData),
    setDisplayAnimation: jest.fn(),
    setDisplayDirection: jest.fn(),
    updateDisplay: jest.fn(),
  });

  visu.setView(view);
  visu.update();

  visu.updateDirection(0);

  expect(view.setDisplayDirection).toHaveBeenLastCalledWith(0);
});

test("sets animation", () => {
  const visu = new StaticFurnitureVisualization();

  const layer: IFurnitureVisualizationLayer = {
    assetCount: 4,
    layerIndex: 0,
    frameRepeat: 1,
    setCurrentFrameIndex: jest.fn(),
    setColor: jest.fn(),
  };

  const visualizationData = mock<IFurnitureVisualizationData>({
    getTransitionForAnimation: jest.fn().mockReturnValue(undefined),
    getAnimation: jest.fn().mockReturnValue({ id: 1 }),
    getFrameCount: jest.fn().mockReturnValue(4),
  });

  const view = mock<IFurnitureVisualizationView>({
    getLayers: jest.fn().mockReturnValue([layer]),
    getVisualizationData: jest.fn().mockReturnValue(visualizationData),
    setDisplayAnimation: jest.fn(),
    setDisplayDirection: jest.fn(),
    updateDisplay: jest.fn(),
  });

  visu.setView(view);
  visu.update();

  visu.updateDirection(0);
  visu.updateAnimation("0");

  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("0");
});
