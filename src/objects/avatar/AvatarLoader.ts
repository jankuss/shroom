import { AvatarLoaderResult, IAvatarLoader } from "../../IAvatarLoader";
import { createLookServer, LookServer } from "./util";
import { avatarFrames } from "./util/avatarFrames";
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

    const loadResources = (action: string, direction: number, frame: number) =>
      getDrawDefinition(look, action, direction, frame)?.parts.forEach(
        (item) => {
          if (loadedFiles.has(item.fileId)) return;
          const globalFile = this.globalCache.get(item.fileId);

          if (globalFile != null) {
            loadedFiles.set(item.fileId, globalFile);
          } else {
            const file = this.options.resolveImage(item.fileId);
            this.globalCache.set(item.fileId, file);
            loadedFiles.set(item.fileId, file);
          }
        }
      );

    directions.forEach((direction) => {
      // Load standing assets
      loadResources("std", direction, 0);

      // Load sitting assets
      if (direction % 2 === 0) {
        loadResources("sit", direction, 0);
        loadResources("lay", direction, 0);
      }

      // Load animated assets
      avatarFrames.forEach((frames, key) => {
        frames.forEach((frame) => {
          loadResources(key, direction, frame);
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
      getDrawDefinition: (look, direction, action, frame) => {
        const result = getDrawDefinition(look, action, direction, frame);
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
