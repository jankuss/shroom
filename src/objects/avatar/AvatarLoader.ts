import { AvatarLoaderResult, IAvatarLoader } from "../../IAvatarLoader";
import { createLookServer, LookServer } from "./util";
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
const frames = [0, 1, 2, 3];

export class AvatarLoader implements IAvatarLoader {
  constructor(private options: Options) {}

  async getAvatarDrawDefinition(look: string): Promise<AvatarLoaderResult> {
    const parsedLook = parseLookString(look);
    const loadedFiles = new Map<string, Promise<PIXI.Texture>>();

    const getDrawDefinition = await this.options.createLookServer();

    const loadResources = (action: string, direction: number, frame: number) =>
      getDrawDefinition(look, action, direction, frame)?.parts.forEach(
        (item) => {
          if (loadedFiles.has(item.fileId)) return;

          loadedFiles.set(item.fileId, this.options.resolveImage(item.fileId));
        }
      );

    directions.forEach((direction) => {
      // Load standing assets
      loadResources("std", direction, 0);

      // Load sitting assets
      if (direction % 2 === 0) {
        loadResources("sit", direction, 0);
      }

      loadResources("wav", direction, 0);

      // Load walking assets
      frames.forEach((frame) => loadResources("wlk", direction, frame));
    });

    const awaitedEntries = await Promise.all(
      [...loadedFiles.entries()].map(
        async ([id, promise]) => [id, await promise] as const
      )
    );

    const awaitedFiles = new Map<string, PIXI.Texture>(awaitedEntries);

    const obj: AvatarLoaderResult = {
      getDrawDefinition: (look, direction, action) => {
        const result = getDrawDefinition(look, action, direction, 0);
        if (result == null) throw new Error("Invalid look");

        return result;
      },
      getTexture: (id) => {
        const texture = awaitedFiles.get(id);
        if (texture == null) throw new Error("Invalid texture");

        return texture;
      },
    };

    return obj;
  }
}
