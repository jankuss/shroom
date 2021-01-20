import { AnimationTicker } from "./animation/AnimationTicker";
import { AvatarLoader } from "./avatar/AvatarLoader";
import { FurnitureLoader } from "./furniture/FurnitureLoader";
import { FurnitureData } from "./furniture/FurnitureData";
import { HitDetection } from "./hitdetection/HitDetection";
import { Dependencies } from "./room/Room";

export class Shroom {
  constructor(public readonly dependencies: Dependencies) {}

  /**
   * Create a shroom instance
   */
  static create(
    options: {
      resourcePath?: string;
      application: PIXI.Application;
    } & Partial<Dependencies>
  ) {
    return this.createShared(options).for(options.application);
  }

  /**
   * Create a shared shroom instance. This is useful if you have multiple
   * `PIXI.Application` which all share the same shroom dependencies.
   */
  static createShared({
    resourcePath,
    configuration,
    animationTicker,
    avatarLoader,
    furnitureData,
    furnitureLoader,
    hitDetection,
  }: {
    resourcePath?: string;
  } & Partial<Dependencies>) {
    const _furnitureData = furnitureData ?? FurnitureData.create(resourcePath);
    const _avatarLoader =
      avatarLoader ?? AvatarLoader.createForAssetBundle(resourcePath);
    const _furnitureLoader =
      furnitureLoader ??
      FurnitureLoader.createForJson(_furnitureData, resourcePath);
    const _configuration = configuration ?? {};

    return {
      for: (application: PIXI.Application) => {
        const _hitDetection = hitDetection ?? HitDetection.create(application);
        const _animationTicker =
          animationTicker ?? AnimationTicker.create(application);

        const realDependencies: Dependencies = {
          animationTicker: _animationTicker,
          avatarLoader: _avatarLoader,
          furnitureLoader: _furnitureLoader,
          hitDetection: _hitDetection,
          configuration: _configuration,
          furnitureData: _furnitureData,
          application,
        };

        return new Shroom(realDependencies);
      },
    };
  }
}
