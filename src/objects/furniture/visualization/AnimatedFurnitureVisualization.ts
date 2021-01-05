import {
  Animation,
  IFurnitureVisualizationData,
} from "../data/interfaces/IFurnitureVisualizationData";
import { FurnitureSprite } from "../FurnitureSprite";
import { IFurnitureVisualization } from "../IFurnitureVisualization";
import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";
import { FurniDrawDefinition, FurniDrawPart } from "../util/DrawDefinition";
import { FurnitureVisualization } from "./FurnitureVisualization";

type InProgressAnimation = { id: number; frameCount: number };

export class AnimatedFurnitureVisualization extends FurnitureVisualization {
  private _animationQueue: InProgressAnimation[] = [];

  private _animationQueueStartFrame: number | undefined;
  private _currentAnimationStartFrame: number | undefined;
  private _animationFrame: number | undefined;
  private _animationFrameCount: number | undefined;

  private _currentAnimationId: number | undefined;
  private _furnitureDrawDefintion: FurniDrawDefinition | undefined;
  private _sprites: Set<FurnitureSprite> = new Set();
  private _initialized = false;
  private _disableTransitions = false;
  private _didIgnoreInitial = false;

  update(view: IFurnitureVisualizationView): void {
    super.update(view);

    this._initialize();

    if (
      this.previousView == null ||
      this.previousView.animation !== this.view.animation
    ) {
      if (!this._didIgnoreInitial) {
        this._didIgnoreInitial = true;
        this._disableTransitions = true;
      } else {
        this._disableTransitions = false;
      }

      this._updateAnimation(this.previousView?.animation, this.view.animation);
    }
  }

  private _initialize() {
    if (this._initialized) return;

    this._furnitureDrawDefintion = this.view.furniture.getDrawDefinition(
      this.view.direction,
      this.view.animation
    );
    this._setCurrentFrame(0, 1);
    this._initialized = true;
  }

  private _getAnimationList(data: IFurnitureVisualizationData, target: number) {
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

    return animations;
  }

  private _updateAnimation(
    oldAnimation: string | undefined,
    newAnimation: string | undefined
  ) {
    if (newAnimation == null) {
    } else if (oldAnimation == newAnimation) {
    } else if (oldAnimation != newAnimation) {
      this._animationQueueStartFrame = undefined;
      this._animationQueue = this._getAnimationList(
        this.view.furniture.visualizationData,
        Number(newAnimation)
      );
    }
  }

  updateFrame(frame: number): void {
    if (this._animationQueueStartFrame == null) {
      this._animationQueueStartFrame = frame;
    }

    if (this._animationQueue.length === 0) {
      return;
    }

    const progress = frame - this._animationQueueStartFrame;

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

    this._setAnimation(animationId, progress);
    this._animationFrameCount = animationFrameCount;

    this._setCurrentFrame(progress, this._animationFrameCount ?? 1);
  }

  private _setAnimation(animation: number, frame: number) {
    if (this._currentAnimationId === animation) return;

    this._currentAnimationStartFrame = frame;
    this._currentAnimationId = animation;
    this._updateFurniture();
  }

  private _updateFurniture() {
    const drawDefintion = this.view.furniture.getDrawDefinition(
      this.view.direction,
      this._currentAnimationId?.toString()
    );

    this._furnitureDrawDefintion = drawDefintion;
    this._setCurrentFrame(0, this._animationFrameCount ?? 1);
  }

  private _setCurrentFrame(frame: number, frameCount: number) {
    this._sprites.forEach((sprite) => (sprite.visible = false));
    this._furnitureDrawDefintion?.parts.forEach((part) => {
      let frameIndex = Math.floor((frame % frameCount) / part.frameRepeat);
      const assetCount = getAssetsCount(part) - 1;

      if (frameIndex > assetCount) {
        frameIndex = assetCount;
      }

      const sprite = this.view.createSprite(part, frameIndex);
      if (sprite != null) {
        this._sprites.add(sprite);
        this.view.container.addChild(sprite);
        sprite.visible = true;
      }
    });
  }

  destroy(): void {}
}

const getAssetsCount = (part: FurniDrawPart) => {
  if (part.assets == null) return 1;

  return part.assets.length;
};
