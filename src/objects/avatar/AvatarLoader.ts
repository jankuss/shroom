import { createLookServer, LookServer } from "./util";
import { LookOptions } from "./util/createLookServer";
import {
  AvatarLoaderResult,
  IAvatarLoader,
} from "../../interfaces/IAvatarLoader";
import { HitTexture } from "../hitdetection/HitTexture";
import Bluebird from "bluebird";
import { AvatarAnimationData } from "./data/AvatarAnimationData";
import { FigureMapData } from "./data/FigureMapData";
import { AvatarOffsetsData } from "./data/AvatarOffsetsData";
import { AvatarPartSetsData } from "./data/AvatarPartSetsData";
import { FigureData } from "./data/FigureData";
import { AvatarActionsData } from "./data/AvatarActionsData";
import { AvatarGeometryData } from "./data/AvatarGeometryData";
import { IAvatarEffectData } from "./data/interfaces/IAvatarEffectData";
import { IAssetBundle } from "../../assets/IAssetBundle";
import { LegacyAssetBundle } from "../../assets/LegacyAssetBundle";
import { ShroomAssetBundle } from "../../assets/ShroomAssetBundle";
import {
  AvatarEffect,
  IAvatarEffectMap,
} from "./data/interfaces/IAvatarEffectMap";
import { AvatarEffectMap } from "./data/AvatarEffectMap";
import { IAvatarEffectBundle } from "./data/interfaces/IAvatarEffectBundle";
import { AvatarEffectBundle } from "./AvatarEffectBundle";
import { getLibrariesForLook } from "./util/getLibrariesForLook";
import { parseLookString } from "./util/parseLookString";
import { AvatarAssetLibraryCollection } from "./AvatarAssetLibraryCollection";
import { ManifestLibrary } from "./data/ManifestLibrary";
import { IManifestLibrary } from "./data/interfaces/IManifestLibrary";
import { AvatarDependencies, AvatarExternalDependencies } from "./types";
import { AvatarDrawDefinition } from "./structure/AvatarDrawDefinition";
import { IAvatarOffsetsData } from "./data/interfaces/IAvatarOffsetsData";

interface Options {
  getAssetBundle: (library: string) => Promise<IAssetBundle>;
  getEffectMap: () => Promise<IAvatarEffectMap>;
  getEffectBundle: (effectData: AvatarEffect) => Promise<IAvatarEffectBundle>;
  createDependencies: () => Promise<AvatarExternalDependencies>;
}

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

  if (lookOptions.effect != null) {
    parts.push(`effect(${lookOptions.effect})`);
  }

  return parts.join(",");
}

export class AvatarLoader implements IAvatarLoader {
  private _lookServer: Promise<LookServer>;
  private _effectCache: Map<
    string,
    Promise<EffectCacheEntry | undefined>
  > = new Map();
  private _lookOptionsCache: Map<string, AvatarDrawDefinition> = new Map();
  private _assetBundles: Map<string, Promise<IManifestLibrary>> = new Map();
  private _effectMap: Promise<IAvatarEffectMap>;
  private _dependencies: Promise<AvatarExternalDependencies>;
  private _offsets = new AvatarAssetLibraryCollection();

  constructor(private _options: Options) {
    this._dependencies = this._options.createDependencies();

    this._lookServer = this._dependencies
      .then(async (dependencies) => {
        return createLookServer({
          ...dependencies,
          offsetsData: this._offsets,
        });
      })
      .then(async (server) => {
        // Wait for the placeholder model to load
        await this._getAvatarDrawDefinition(server, {
          direction: 0,
          headDirection: 0,
          actions: new Set(),
          look: "hd-99999-99999",
        });

        return server;
      });

    this._effectMap = this._options.getEffectMap();
  }

  static create(resourcePath = "") {
    return new AvatarLoader({
      createDependencies: () =>
        initializeDefaultAvatarDependencies(resourcePath),
      getAssetBundle: async (library) => {
        return new LegacyAssetBundle(`${resourcePath}/figure/${library}`);
      },
      getEffectMap: async () => {
        const response = await fetch(`${resourcePath}/effectmap.xml`);
        const text = await response.text();

        return new AvatarEffectMap(text);
      },
      getEffectBundle: async (effect) => {
        const data = await ShroomAssetBundle.fromUrl(
          `${resourcePath}/effects/${effect.lib}.shroom`
        );
        return new AvatarEffectBundle(data);
      },
    });
  }

  static createForAssetBundle(resourcePath = "") {
    return new AvatarLoader({
      createDependencies: () =>
        initializeDefaultAvatarDependencies(resourcePath),
      getAssetBundle: async (library) => {
        return ShroomAssetBundle.fromUrl(
          `${resourcePath}/figure/${library}.shroom`
        );
      },
      getEffectMap: async () => {
        const response = await fetch(`${resourcePath}/effectmap.xml`);
        const text = await response.text();

        return new AvatarEffectMap(text);
      },
      getEffectBundle: async (effect) => {
        const data = await ShroomAssetBundle.fromUrl(
          `${resourcePath}/effects/${effect.lib}.shroom`
        );
        return new AvatarEffectBundle(data);
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
    const { effect } = options;

    let effectData: IAvatarEffectData | undefined;
    let effectBundle: IAvatarEffectBundle | undefined;

    // If an effect is set, try to load it
    if (effect != null) {
      const effectCache = await this._loadEffectCached(effect);
      if (effectCache != null) {
        effectData = effectCache.effectData;
        effectBundle = effectCache.effectBundle;
      }
    }

    const { figureData, figureMap } = await this._dependencies;

    // Open the effect library
    if (effectBundle != null) {
      await this._offsets.open(effectBundle);
    }

    // Get the required libraries for the look
    const libs = getLibrariesForLook(parseLookString(options.look), {
      figureData: figureData,
      figureMap: figureMap,
    });

    // Open the required libraries for the look
    await Promise.all(
      Array.from(libs).map((lib) =>
        this._getAssetBundle(lib).then((bundle) => this._offsets.open(bundle))
      )
    );

    // Get asset ids for the look
    const fileIds = getDrawDefinition(options, effectData)
      ?.getDrawDefinition()
      .flatMap((part) => part.assets)
      .map((asset) => asset.fileId);

    // Load the required textures for the look
    if (fileIds != null) {
      await this._offsets.loadTextures(fileIds);
    }

    return {
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
        const texture = this._offsets.getTexture(id);

        if (texture == null) {
          console.error("Texture not found in", this._offsets);
          throw new Error(`Invalid texture: ${id}`);
        }

        return texture;
      },
    };
  }

  private async _loadEffectCached(effect: string) {
    const current = this._effectCache.get(effect);
    if (current != null) return current;

    const promise = this._loadEffect(effect);
    this._effectCache.set(effect, promise);

    return promise;
  }

  private async _loadEffect(
    effect: string
  ): Promise<EffectCacheEntry | undefined> {
    const effectMap = await this._effectMap;

    const effectInfo = effectMap.getEffectInfo(effect);

    if (effectInfo != null) {
      const effectBundle = await this._options.getEffectBundle(effectInfo);
      const effectData = await effectBundle.getData();

      return {
        effectBundle,
        effectData,
      };
    }
  }

  private async _getAssetBundle(library: string) {
    const current = this._assetBundles.get(library);
    if (current != null) return current;

    const bundle = this._options
      .getAssetBundle(library)
      .then((bundle) => new ManifestLibrary(bundle));
    this._assetBundles.set(library, bundle);

    return bundle;
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

interface EffectCacheEntry {
  effectBundle: IAvatarEffectBundle;
  effectData: IAvatarEffectData;
}

async function initializeDefaultAvatarDependencies(
  resourcePath: string
): Promise<AvatarExternalDependencies> {
  const {
    animationData,
    figureMap,
    figureData,
    partSetsData,
    actionsData,
    geometry,
  } = await Bluebird.props({
    animationData: AvatarAnimationData.default(),
    figureData: FigureData.fromUrl(`${resourcePath}/figuredata.xml`),
    figureMap: FigureMapData.fromUrl(`${resourcePath}/figuremap.xml`),
    partSetsData: AvatarPartSetsData.default(),
    actionsData: AvatarActionsData.default(),
    geometry: AvatarGeometryData.default(),
  });

  return {
    animationData,
    figureData,
    figureMap,
    partSetsData,
    actionsData,
    geometry,
  };
}
