import {
  FurnitureAnimation,
  IFurnitureVisualizationData,
} from "../../data/interfaces/IFurnitureVisualizationData";
import {
  IFurnitureVisualizationLayer,
  IFurnitureVisualizationView,
} from "../../IFurnitureVisualizationView";
import { AnimatedFurnitureVisualization } from "../AnimatedFurnitureVisualization";
import { mock } from "../../../../util/mock";

test("sets animation correctly", () => {
  const visu = new AnimatedFurnitureVisualization();

  const layer: IFurnitureVisualizationLayer = {
    assetCount: 1,
    layerIndex: 0,
    frameRepeat: 1,
    setCurrentFrameIndex: jest.fn(),
    setColor: jest.fn(),
  };

  const visualizationData = mock<IFurnitureVisualizationData>({
    getTransitionForAnimation: jest.fn().mockReturnValue(undefined),
    getAnimation: jest.fn().mockReturnValue({ id: 1 }),
    getFrameCount: jest.fn().mockReturnValue(1),
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

  visu.updateAnimation("1");
  visu.updateDirection(0);
  visu.updateFrame(0);

  expect(view.setDisplayAnimation).toBeCalledWith("1");
  expect(view.setDisplayDirection).toBeCalledWith(0);
});

test("animation loops after its done", () => {
  const visu = new AnimatedFurnitureVisualization();

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

  visu.updateAnimation("1");
  visu.updateDirection(0);
  visu.updateFrame(0);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(0);

  visu.updateFrame(1);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(1);

  visu.updateFrame(2);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(2);

  visu.updateFrame(3);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(3);

  visu.updateFrame(4);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(0);
});

test("starts new animation when animation is running", () => {
  const visu = new AnimatedFurnitureVisualization();

  const layer: IFurnitureVisualizationLayer = {
    assetCount: 4,
    layerIndex: 0,
    frameRepeat: 1,
    setCurrentFrameIndex: jest.fn(),
    setColor: jest.fn(),
  };

  const visualizationData = mock<IFurnitureVisualizationData>({
    getTransitionForAnimation: jest.fn().mockReturnValue(undefined),
    getAnimation: jest.fn((size: number, animation: number) => {
      if (animation === 1) return { id: 1 };
      if (animation === 2) return { id: 2 };
      if (animation === 0) return { id: 0 };
      throw new Error("Invalid animation");
    }),
    getFrameCount: jest.fn((size: number, animation: number) => {
      if (animation === 0) return 1;

      return 4;
    }),
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

  visu.updateAnimation("1");
  visu.updateDirection(0);
  visu.updateFrame(0);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(0);

  visu.updateFrame(1);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(1);

  visu.updateFrame(2);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(2);

  visu.updateAnimation("2");

  visu.updateFrame(3);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(0);

  visu.updateFrame(4);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(1);

  visu.updateAnimation("0");

  visu.updateFrame(5);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(0);
});

test("keeps animation state when direction changed", () => {
  const visu = new AnimatedFurnitureVisualization();

  const layer: IFurnitureVisualizationLayer = {
    assetCount: 4,
    layerIndex: 0,
    frameRepeat: 1,
    setCurrentFrameIndex: jest.fn(),
    setColor: jest.fn(),
  };

  const visualizationData = mock<IFurnitureVisualizationData>({
    getTransitionForAnimation: jest.fn().mockReturnValue(undefined),
    getAnimation: jest.fn((size: number, animation: number) => {
      if (animation === 1) return { id: 1 };
      if (animation === 2) return { id: 2 };
      if (animation === 0) return { id: 0 };
      throw new Error("Invalid animation");
    }),
    getFrameCount: jest.fn((size: number, animation: number) => {
      if (animation === 0) return 1;

      return 4;
    }),
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

  visu.updateAnimation("1");
  visu.updateDirection(0);
  visu.updateFrame(0);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(0);

  visu.updateFrame(1);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(1);

  visu.updateFrame(2);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(2);

  visu.updateDirection(2);

  visu.updateFrame(3);
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(3);
});

test("plays transition animation before the target animation", () => {
  const visu = new AnimatedFurnitureVisualization();

  const layer: IFurnitureVisualizationLayer = {
    assetCount: 4,
    layerIndex: 0,
    frameRepeat: 1,
    setCurrentFrameIndex: jest.fn(),
    setColor: jest.fn(),
  };

  const visualizationData = mock<IFurnitureVisualizationData>({
    getTransitionForAnimation: jest.fn((size: number, transitionTo: number):
      | FurnitureAnimation
      | undefined => {
      if (transitionTo === 1) return { id: 100 };

      return undefined;
    }),
    getAnimation: jest.fn((size: number, animation: number) => {
      if (animation === 1) return { id: 1 };
      if (animation === 100) return { id: 100, transitionTo: 1 };
      if (animation === 0) return { id: 0 };
      throw new Error("Invalid animation");
    }),
    getFrameCount: jest.fn((size: number, animation: number) => {
      if (animation === 0) return 1;

      return 4;
    }),
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

  visu.updateAnimation("0");
  visu.updateDirection(0);
  visu.updateFrame(0);
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("0");

  visu.updateAnimation("1");
  visu.updateFrame(1); // Animation: 100 - Frame: 0
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("100");
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(0);

  visu.updateFrame(2); // Animation: 100 - Frame: 1
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("100");
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(1);

  visu.updateFrame(3); // Animation: 100 - Frame: 2
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("100");
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(2);

  visu.updateFrame(4); // Animation: 100 - Frame: 3
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("100");
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(3);

  visu.updateFrame(5); // Animation: 1 - Frame: 0
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("1");
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(0);
});

test("plays transition animation before the target animation", () => {
  const visu = new AnimatedFurnitureVisualization();

  const layer: IFurnitureVisualizationLayer = {
    assetCount: 4,
    layerIndex: 0,
    frameRepeat: 1,
    setCurrentFrameIndex: jest.fn(),
    setColor: jest.fn(),
  };

  const visualizationData = mock<IFurnitureVisualizationData>({
    getTransitionForAnimation: jest.fn((size: number, transitionTo: number):
      | FurnitureAnimation
      | undefined => {
      if (transitionTo === 1) return { id: 100 };

      return undefined;
    }),
    getAnimation: jest.fn((size: number, animation: number) => {
      if (animation === 1) return { id: 1 };
      if (animation === 100) return { id: 100, transitionTo: 1 };
      if (animation === 0) return { id: 0 };
      throw new Error("Invalid animation");
    }),
    getFrameCount: jest.fn((size: number, animation: number) => {
      if (animation === 0) return 1;

      return 4;
    }),
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

  visu.updateAnimation("0");
  visu.updateDirection(0);
  visu.updateFrame(0);
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("0");

  visu.updateAnimation("1");
  visu.updateFrame(1); // Animation: 100 - Frame: 0
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("100");
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(0);

  visu.updateFrame(2); // Animation: 100 - Frame: 1
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("100");
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(1);

  visu.updateFrame(3); // Animation: 100 - Frame: 2
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("100");
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(2);

  visu.updateFrame(4); // Animation: 100 - Frame: 3
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("100");
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(3);

  visu.updateFrame(5); // Animation: 1 - Frame: 0
  expect(view.setDisplayAnimation).toHaveBeenLastCalledWith("1");
  expect(layer.setCurrentFrameIndex).toHaveBeenLastCalledWith(0);
});
