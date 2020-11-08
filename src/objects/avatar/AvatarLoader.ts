import { AvatarLoaderResult, IAvatarLoader } from "../../IAvatarLoader";
import { createLookServer, LookServer } from "./util";
import { avatarFrames, avatarFramesObject } from "./util/avatarFrames";
import { LookOptions } from "./util/createLookServer";
import {
  getAvatarDrawDefinition,
  Dependencies,
  AvatarDrawDefinition,
} from "./util/getAvatarDrawDefinition";
import { parseLookString } from "./util/parseLookString";

interface Options {
  resolveImage: (id: string) => Promise<PIXI.Texture>;
  createLookServer: () => Promise<LookServer>;
}

const directions = [0, 1, 2, 3, 4, 5, 6, 7];

export class AvatarLoader implements IAvatarLoader {
  private globalCache: Map<string, Promise<PIXI.Texture>> = new Map();
  private lookServer: Promise<LookServer>;

  constructor(private options: Options) {
    this.lookServer = this.options.createLookServer();
  }

  async getAvatarDrawDefinition(look: string): Promise<AvatarLoaderResult> {
    const parsedLook = parseLookString(look);
    const loadedFiles = new Map<string, Promise<PIXI.Texture>>();

    const getDrawDefinition = await this.lookServer;

    const loadResources = (options: LookOptions) =>
      getDrawDefinition(options)?.parts.forEach((item) => {
        if (loadedFiles.has(item.fileId)) return;
        const globalFile = this.globalCache.get(item.fileId);

        if (globalFile != null) {
          loadedFiles.set(item.fileId, globalFile);
        } else {
          const file = this.options.resolveImage(item.fileId);
          this.globalCache.set(item.fileId, file);
          loadedFiles.set(item.fileId, file);
        }
      });

    directions.forEach((direction) => {
      // Load standing assets
      loadResources({
        action: { kind: "std" },
        direction,
        look,
        actions: {},
      });

      loadResources({
        action: { kind: "std" },
        direction,
        look,
        actions: {
          item: { kind: "crr", item: 1 },
        },
      });

      loadResources({
        action: { kind: "std" },
        direction,
        look,
        actions: {
          item: { kind: "drk", item: 1 },
        },
      });

      avatarFramesObject.wlk.forEach((frame) => {
        loadResources({
          action: { kind: "wlk", frame },
          direction,
          look,
          actions: {},
        });
      });

      // Load sitting assets
      if (direction % 2 === 0) {
        loadResources({
          action: { kind: "sit" },
          direction,
          look,
          actions: {},
        });

        loadResources({
          action: { kind: "lay" },
          direction,
          look,
          actions: {},
        });
      }

      avatarFramesObject.wav.forEach((frame) => {
        loadResources({
          action: { kind: "std" },
          direction,
          look,
          actions: {
            wav: { frame },
          },
        });
      });
    });

    const awaitedEntries = await Promise.all(
      [...loadedFiles.entries()].map(
        async ([id, promise]) => [id, await promise] as const
      )
    );

    const awaitedFiles = new Map<string, PIXI.Texture>(awaitedEntries);

    const obj: AvatarLoaderResult = {
      getDrawDefinition: (options) => {
        const result = getDrawDefinition(options);
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
