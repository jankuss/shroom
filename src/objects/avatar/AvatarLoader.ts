import { AvatarDrawDefinition, createLookServer, LookServer } from "./util";
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

function _getLookOptionsString(lookOptions: LookOptions) {
  const parts: string[] = [];

  if (lookOptions.actions.size > 0) {
    const actionString = Array.from(lookOptions.actions)
      .map((action) => action)
      .join(",");
    parts.push(`actions(${actionString})`);
  }

  parts.push(`direction(${lookOptions.direction})`);
  parts.push(`headdirection(${lookOptions.headDirection})`);

  if (lookOptions.item != null) {
    parts.push(`item(${lookOptions.item})`);
  }

  if (lookOptions.look != null) {
    parts.push(`look(${lookOptions.look})`);
  }

  return parts.join(",");
}

export class AvatarLoader implements IAvatarLoader {
  private globalCache: Map<string, Promise<HitTexture>> = new Map();
  private lookServer: Promise<LookServer>;
  private effectCache: Map<string, Promise<IAvatarEffectData>> = new Map();
  private lookOptionsCache: Map<string, AvatarDrawDefinition> = new Map();

  constructor(private options: Options) {
    this.lookServer = this.options.createLookServer().then(async (server) => {
      // Wait for the placeholder model to load
      await this._getAvatarDrawDefinition(server, {
        direction: 0,
        headDirection: 0,
        actions: new Set(),
        look: "hd-99999-99999",
      });

      return server;
    });
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
          animationData: AvatarAnimationData.default(),
          figureData: FigureData.fromUrl(`${resourcePath}/figuredata.xml`),
          figureMap: FigureMapData.fromUrl(`${resourcePath}/figuremap.xml`),
          offsetsData: AvatarOffsetsData.fromUrl(
            `${resourcePath}/offsets.json`
          ),
          partSetsData: AvatarPartSetsData.default(),
          actionsData: AvatarActionsData.default(),
          geometry: AvatarGeometryData.default(),
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

  private _getDrawDefinitionCached(
    getAvatarDrawDefinition: LookServer,
    lookOptions: LookOptions,
    effect: IAvatarEffectData | undefined
  ) {
    const key = _getLookOptionsString(lookOptions);

    const existing = this.lookOptionsCache.get(key);

    if (existing != null) {
      return existing;
    }

    const drawDefinition = getAvatarDrawDefinition(lookOptions, effect);
    if (drawDefinition == null) return;

    this.lookOptionsCache.set(key, drawDefinition);

    return drawDefinition;
  }

  async getAvatarDrawDefinition(
    options: LookOptions
  ): Promise<AvatarLoaderResult> {
    const getDrawDefinition = await this.lookServer;

    return this._getAvatarDrawDefinition(getDrawDefinition, options);
  }

  async _getAvatarDrawDefinition(
    getDrawDefinition: LookServer,
    options: LookOptions
  ): Promise<AvatarLoaderResult> {
    const { actions, look, item, effect, initial, skipCaching } = options;

    const loadedFiles = new Map<string, Promise<HitTexture>>();

    let effectData: IAvatarEffectData | undefined;
    if (effect != null) {
      effectData = await this._loadEffect(effect.type, effect.id);
    }

    const loadResources = (options: LookOptions) =>
      this._getDrawDefinitionCached(
        getDrawDefinition,
        options,
        effectData
      )?.parts.forEach((parts) => {
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

    const loadDirection = (direction: number, headDirection: number) => {
      loadResources({
        actions: new Set(actions),
        direction,
        headDirection,
        look,
        item,
      });

      if (initial != null) {
        preloadActions.forEach((action) => {
          loadResources({
            actions: new Set([action]),
            direction,
            headDirection,
            look,
          });
        });
      }
    }

    if (skipCaching) {
      loadDirection(options.direction, options.headDirection ?? options.direction);
    } else {
      directions.forEach((direction) => {
        directions.forEach(headDirection => {
          loadDirection(direction, headDirection);
        })
      });
    }

    const awaitedEntries = await Promise.all(
      [...loadedFiles.entries()].map(
        async ([id, promise]) => [id, await promise] as const
      )
    );

    const awaitedFiles = new Map<string, HitTexture>(awaitedEntries);

    const obj: AvatarLoaderResult = {
      getDrawDefinition: (options) => {
        const result = this._getDrawDefinitionCached(
          getDrawDefinition,
          options,
          effectData
        );
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
