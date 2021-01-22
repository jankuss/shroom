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
import { IAssetBundle } from "../../assets/IAssetBundle";
import { LegacyAssetBundle } from "../../assets/LegacyAssetBundle";
import { ShroomAssetBundle } from "../../assets/ShroomAssetBundle";

interface Options {
  getAssetBundle: (library: string) => Promise<IAssetBundle>;
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
  private _globalCache: Map<string, Promise<HitTexture>> = new Map();
  private _lookServer: Promise<LookServer>;
  private _effectCache: Map<string, Promise<IAvatarEffectData>> = new Map();
  private _lookOptionsCache: Map<string, AvatarDrawDefinition> = new Map();
  private _assetBundles: Map<string, Promise<IAssetBundle>> = new Map();

  constructor(private _options: Options) {
    this._lookServer = this._options.createLookServer().then(async (server) => {
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

  static create(resourcePath = "") {
    return new AvatarLoader({
      createLookServer: async () => {
        return initializeDefaultLookServer(resourcePath);
      },
      getAssetBundle: async (library) => {
        return new LegacyAssetBundle(`${resourcePath}/figure/${library}`);
      },
    });
  }

  static createForAssetBundle(resourcePath = "") {
    return new AvatarLoader({
      createLookServer: async () => {
        return initializeDefaultLookServer(resourcePath);
      },
      getAssetBundle: async (library) => {
        return ShroomAssetBundle.fromUrl(
          `${resourcePath}/figure/${library}.shroom`
        );
      },
    });
  }

  async getAvatarDrawDefinition(
    options: LookOptions
  ): Promise<AvatarLoaderResult> {
    const getDrawDefinition = await this._lookServer;

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
          const globalFile = this._globalCache.get(item.fileId);

          if (globalFile != null) {
            loadedFiles.set(item.fileId, globalFile);
          } else {
            const file = this._getAssetBundle(item.library)
              .then((bundle) => bundle.getBlob(`${item.fileId}.png`))
              .then((blob) => HitTexture.fromBlob(blob));
            this._globalCache.set(item.fileId, file);
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
    };

    if (skipCaching) {
      loadDirection(
        options.direction,
        options.headDirection ?? options.direction
      );
    } else {
      directions.forEach((direction) => {
        directions.forEach((headDirection) => {
          loadDirection(direction, headDirection);
        });
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

  private async _getAssetBundle(library: string) {
    const current = this._assetBundles.get(library);
    if (current != null) return current;

    const bundle = this._options.getAssetBundle(library);
    this._assetBundles.set(library, bundle);

    return bundle;
  }

  private _loadEffect(type: string, id: string) {
    const key = `${type}_${id}`;
    let current = this._effectCache.get(key);

    if (current == null) {
      current = AvatarEffectData.fromUrl(
        `./resources/figure/hh_human_fx/hh_human_fx_${type}${id}.bin`
      );
      this._effectCache.set(key, current);
    }

    return current;
  }

  private _getDrawDefinitionCached(
    getAvatarDrawDefinition: LookServer,
    lookOptions: LookOptions,
    effect: IAvatarEffectData | undefined
  ) {
    const key = _getLookOptionsString(lookOptions);

    const existing = this._lookOptionsCache.get(key);

    if (existing != null) {
      return existing;
    }

    const drawDefinition = getAvatarDrawDefinition(lookOptions, effect);
    if (drawDefinition == null) return;

    this._lookOptionsCache.set(key, drawDefinition);

    return drawDefinition;
  }
}

async function initializeDefaultLookServer(resourcePath: string) {
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
    offsetsData: AvatarOffsetsData.fromUrl(`${resourcePath}/offsets.json`),
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
}
