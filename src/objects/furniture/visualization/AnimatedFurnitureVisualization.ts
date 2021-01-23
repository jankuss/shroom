import { IFurnitureVisualizationData } from "../data/interfaces/IFurnitureVisualizationData";
import { FurnitureSprite } from "../FurnitureSprite";
import { FurniDrawDefinition, FurniDrawPart } from "../util/DrawDefinition";
import { FurnitureVisualization } from "./FurnitureVisualization";

type InProgressAnimation = { id: number; frameCount: number };

export class AnimatedFurnitureVisualization extends FurnitureVisualization {
  private _animationQueue: InProgressAnimation[] = [];

  private _animationQueueStartFrame: number | undefined;
  private _animationFrameCount: number | undefined;

  private _currentAnimationId: number | undefined;
  private _furnitureDrawDefintion: FurniDrawDefinition | undefined;
  private _sprites: Set<FurnitureSprite> = new Set();
  private _disableTransitions = false;
  private _frame = 0;
  private _overrideAnimation: number | undefined;
  private _modifier: ((part: FurniDrawPart) => FurniDrawPart) | undefined;

  private _currentDirection: number | undefined;
  private _currentTargetAnimationId: string | undefined;
  private _changeAnimationCount = 0;
  private _lastFramePlayedMap: Map<number, boolean> = new Map();

  private _refreshFurniture = false;

  constructor() {
    super();
    this._refreshFurniture = true;
  }

  public get animationId() {
    if (this._overrideAnimation != null) {
      return this._overrideAnimation;
    }

    return this._currentAnimationId;
  }

  public set animationId(value) {
    this._overrideAnimation = value;
    this._refreshFurniture = true;
  }

  public get modifier() {
    return this._modifier;
  }

  public set modifier(value) {
    this._modifier = value;
    this._updateFurniture();
  }

  setCurrentAnimation(newAnimation: number) {
    this._animationQueueStartFrame = undefined;
    // Skip the transitions of the initial animation change.
    this._animationQueue = this._getAnimationList(
      this.view.furniture.visualizationData,
      newAnimation
    );

    this._disableTransitions = this._changeAnimationCount === 0;
    this._changeAnimationCount++;

    this._update();
  }

  updateAnimation(animation: string): void {
    this._updateAnimation(this._currentTargetAnimationId, animation);
  }

  updateDirection(direction: number): void {
    if (this._currentDirection === direction) return;

    this._currentDirection = direction;
    this._updateFurniture();
  }

  isLastFramePlayedForLayer(layerIndex: number) {
    return this._lastFramePlayedMap.get(layerIndex) ?? false;
  }

  destroy(): void {
    this._sprites.forEach((sprite) => this.view.destroySprite(sprite));
  }

  update() {
    this._update();
  }

  updateFrame(frame: number): void {
    if (this._refreshFurniture) {
      this._refreshFurniture = false;
      this._updateFurniture();
    }

    if (this._animationQueueStartFrame == null) {
      this._animationQueueStartFrame = frame;
    }

    if (this._animationQueue.length > 0) {
      const progress = this._getCurrentProgress(frame);

      let frameCounter = 0;
      let animationId: number | undefined;
      let animationFrameCount: number | undefined;

      for (let i = 0; i < this._animationQueue.length; i++) {
        const animation = this._animationQueue[i];

        frameCounter += animation.frameCount;

        if (progress < frameCounter) {
          animationId = animation.id;
          animationFrameCount = animation.frameCount;
          break;
        }
      }

      if (
        animationId == null ||
        animationFrameCount == null ||
        this._disableTransitions
      ) {
        const animation = this._animationQueue[this._animationQueue.length - 1];
        animationId = animation.id;
        animationFrameCount = animation.frameCount;
      }

      this._setAnimation(animationId);

      this._animationFrameCount = animationFrameCount;
      this._frame = progress;
    }

    this._update(true);
  }

  private _getCurrentProgress(frame: number) {
    if (this._animationQueueStartFrame == null) {
      return 0;
    }

    return frame - this._animationQueueStartFrame;
  }

  private _setAnimation(animation: number) {
    if (this._currentAnimationId === animation) return;

    this._currentAnimationId = animation;
    this._updateFurniture();
  }

  private _updateFurniture() {
    if (!this.mounted) return;

    const drawDefintion = this.view.furniture.getDrawDefinition(
      this._currentDirection ?? 0,
      this.animationId?.toString()
    );

    if (this.modifier == null) {
      this._furnitureDrawDefintion = drawDefintion;
    } else {
      const modifier = this.modifier;

      this._furnitureDrawDefintion = {
        ...drawDefintion,
        parts: drawDefintion.parts.map((part) => modifier(part)),
      };
    }

    this._update();
  }

  private _update(skipLayerUpdate = false) {
    const frameCount = this._animationFrameCount ?? 1;

    this._sprites.forEach((sprite) => {
      sprite.visible = false;

      if (sprite instanceof FurnitureSprite) {
        sprite.ignore = true;
      }
    });
    this._furnitureDrawDefintion?.parts.forEach((part) => {
      if (this.modifier != null) {
        part = this.modifier(part);
      }

      const frameProgress = this._frame % frameCount;

      let frameIndex = Math.floor(frameProgress / part.frameRepeat);
      const assetCount = getAssetsCount(part) - 1;

      if (frameIndex > assetCount) {
        frameIndex = assetCount;
      }

      if (frameProgress === frameCount - 1) {
        this._lastFramePlayedMap.set(part.layerIndex, true);
      } else {
        this._lastFramePlayedMap.set(part.layerIndex, false);
      }

      const sprite = this.view.createSprite(part, frameIndex, skipLayerUpdate);
      if (sprite != null) {
        this._sprites.add(sprite);
        sprite.visible = true;

        if (sprite instanceof FurnitureSprite) {
          sprite.ignore = false;
        }
      }
    });
  }

  private _getAnimationList(
    data: IFurnitureVisualizationData,
    target: number
  ): InProgressAnimation[] {
    const animations: InProgressAnimation[] = [];

    const handleAnimation = (id: number) => {
      const transition = data.getTransitionForAnimation(64, id);

      if (transition != null) {
        handleAnimation(transition.id);
      }

      const animation = data.getAnimation(64, id);
      const frameCount = data.getFrameCount(64, id) ?? 1;

      if (animation != null) {
        animations.push({ id: animation.id, frameCount });
      }
    };

    handleAnimation(target);

    if (animations.length === 0) {
      return [{ id: 0, frameCount: 1 }];
    }

    return animations;
  }

  private _updateAnimation(
    oldAnimation: string | undefined,
    newAnimation: string | undefined
  ) {
    this._currentTargetAnimationId = newAnimation;
    if (newAnimation == null) {
      this.setCurrentAnimation(0);
    } else if (oldAnimation == newAnimation) {
      // Do nothing
    } else if (oldAnimation != newAnimation) {
      this.setCurrentAnimation(Number(newAnimation));
    }
  }
}

const getAssetsCount = (part: FurniDrawPart) => {
  if (part.assets == null) return 1;

  return part.assets.length;
};
