import { createLookServer, LookServer } from "./util";
import { LookOptions } from "./util/createLookServer";
import {
  AvatarLoaderResult,
  IAvatarLoader,
} from "../../interfaces/IAvatarLoader";
import { HitTexture } from "../hitdetection/HitTexture";
import Bluebird from "bluebird";
import { AvatarAnimationData } from "./util/data/AvatarAnimationData";
import { FigureMapData } from "./util/data/FigureMapData";
import { AvatarOffsetsData } from "./util/data/AvatarOffsetsData";
import { AvatarPartSetsData } from "./util/data/AvatarPartSetsData";
import { FigureData } from "./util/data/FigureData";
import { AvatarActionsData } from "./util/data/AvatarActionsData";
import { AvatarGeometryData } from "./util/data/AvatarGeometryData";
import { AvatarAction } from "./enum/AvatarAction";
import { AvatarEffectData } from "./util/data/AvatarEffectData";
import { IAvatarEffectData } from "./util/data/interfaces/IAvatarEffectData";

interface Options {
  resolveImage: (id: string, library: string) => Promise<HitTexture>;
  createLookServer: () => Promise<LookServer>;
}

const directions = [0, 1, 2, 3, 4, 5, 6, 7];

const preloadActions = new Set([
  AvatarAction.Default,
  AvatarAction.Move,
  AvatarAction.Sit,
]);

export class AvatarLoader implements IAvatarLoader {
  private globalCache: Map<string, Promise<HitTexture>> = new Map();
  private lookServer: Promise<LookServer>;
  private effectCache: Map<string, Promise<IAvatarEffectData>> = new Map();

  constructor(private options: Options) {
    this.lookServer = this.options.createLookServer();
  }

  private _loadEffect(type: string, id: string) {
    const key = `${type}_${id}`;
    let current = this.effectCache.get(key);

    if (current == null) {
      current = AvatarEffectData.fromUrl(
        `./resources/figure/hh_human_fx/hh_human_fx_${type}${id}.bin`
      );
      this.effectCache.set(key, current);
    }

    return current;
  }

  static create(resourcePath: string = "") {
    return new AvatarLoader({
      createLookServer: async () => {
        const {
          animationData,
          offsetsData,
          figureMap,
          figureData,
          partSetsData,
          actionsData,
          geometry,
        } = await Bluebird.props({
          animationData: AvatarAnimationData.fromUrl(
            `${resourcePath}/HabboAvatarRenderLib_HabboAvatarAnimation.bin`
          ),
          figureData: FigureData.fromUrl(`${resourcePath}/figuredata.xml`),
          figureMap: FigureMapData.fromUrl(`${resourcePath}/figuremap.xml`),
          offsetsData: AvatarOffsetsData.fromUrl(
            `${resourcePath}/offsets.json`
          ),
          partSetsData: AvatarPartSetsData.fromUrl(
            `${resourcePath}/HabboAvatarRenderLib_HabboAvatarPartSets.bin`
          ),
          actionsData: AvatarActionsData.fromUrl(`${resourcePath}/actions.xml`),
          geometry: AvatarGeometryData.fromUrl(
            `${resourcePath}/HabboAvatarRenderLib_HabboAvatarGeometry.bin`
          ),
        });

        return createLookServer({
          animationData,
          figureData,
          offsetsData,
          figureMap,
          partSetsData,
          actionsData,
          geometry,
        });
      },
      resolveImage: async (id, library) => {
        return HitTexture.fromUrl(
          `${resourcePath}/figure/${library}/${id}.png`
        );
      },
    });
  }

  async getAvatarDrawDefinition({
    actions,
    look,
    item,
    effect,
    initial,
  }: LookOptions): Promise<AvatarLoaderResult> {
    const loadedFiles = new Map<string, Promise<HitTexture>>();

    const getDrawDefinition = await this.lookServer;

    let effectData: IAvatarEffectData | undefined;
    if (effect != null) {
      effectData = await this._loadEffect(effect.type, effect.id);
    }

    const loadResources = (options: LookOptions) =>
      getDrawDefinition(options, effectData)?.parts.forEach((parts) => {
        parts.assets.forEach((item) => {
          if (loadedFiles.has(item.fileId)) return;
          const globalFile = this.globalCache.get(item.fileId);

          if (globalFile != null) {
            loadedFiles.set(item.fileId, globalFile);
          } else {
            const file = this.options.resolveImage(item.fileId, item.library);
            this.globalCache.set(item.fileId, file);
            loadedFiles.set(item.fileId, file);
          }
        });
      });

    directions.forEach((direction) => {
      loadResources({
        actions: new Set(actions),
        direction,
        look,
        item,
      });

      if (initial != null) {
        preloadActions.forEach((action) => {
          loadResources({
            actions: new Set([action]),
            direction,
            look,
          });
        });
      }
    });

    const awaitedEntries = await Promise.all(
      [...loadedFiles.entries()].map(
        async ([id, promise]) => [id, await promise] as const
      )
    );

    const awaitedFiles = new Map<string, HitTexture>(awaitedEntries);

    const obj: AvatarLoaderResult = {
      getDrawDefinition: (options) => {
        const result = getDrawDefinition(options, effectData);
        if (result == null) throw new Error("Invalid look");

        return result;
      },
      getTexture: (id) => {
        const texture = awaitedFiles.get(id);
        if (texture == null) throw new Error(`Invalid texture: ${id}`);

        return texture;
      },
    };

    return obj;
  }
}
