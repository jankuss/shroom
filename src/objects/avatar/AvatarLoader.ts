import { createLookServer, loadOffsetMapFromJson, LookServer } from "./util";
import { avatarFramesObject } from "./util/avatarFrames";
import { LookOptions } from "./util/createLookServer";
import {
  AvatarLoaderResult,
  IAvatarLoader,
} from "../../interfaces/IAvatarLoader";
import { HitTexture } from "../hitdetection/HitTexture";

interface Options {
  resolveImage: (id: string, library: string) => Promise<HitTexture>;
  createLookServer: () => Promise<LookServer>;
}

const directions = [0, 1, 2, 3, 4, 5, 6, 7];

export class AvatarLoader implements IAvatarLoader {
  private globalCache: Map<string, Promise<HitTexture>> = new Map();
  private lookServer: Promise<LookServer>;

  constructor(private options: Options) {
    this.lookServer = this.options.createLookServer();
  }

  static create(resourcePath: string = "") {
    return new AvatarLoader({
      createLookServer: async () => {
        const fetchString = (url: string) =>
          fetch(url).then((response) => response.text());
        const fetchJson = (url: string) =>
          fetch(url).then((response) => response.json());

        return createLookServer({
          figureDataString: await fetchString(resourcePath + "/figuredata.xml"),
          figureMapString: await fetchString(resourcePath + "/figuremap.xml"),
          loadOffsetMap: async () =>
            loadOffsetMapFromJson(
              await fetchJson(resourcePath + "/offsets.json")
            ).getOffset,
        });
      },
      resolveImage: async (id, library) => {
        return HitTexture.fromUrl(
          `${resourcePath}/figure/${library}/${id}.png`
        );
      },
    });
  }

  async getAvatarDrawDefinition(
    look: string,
    additional?: { item?: number }
  ): Promise<AvatarLoaderResult> {
    const loadedFiles = new Map<string, Promise<HitTexture>>();

    const getDrawDefinition = await this.lookServer;

    const loadResources = (options: LookOptions) =>
      getDrawDefinition(options)?.parts.forEach((item) => {
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

    directions.forEach((direction) => {
      // Load standing assets
      loadResources({
        action: { kind: "std" },
        direction,
        look,
        actions: {},
      });

      if (additional != null && additional.item != null) {
        loadResources({
          action: { kind: "std" },
          direction,
          look,
          actions: {
            item: { kind: "crr", item: additional.item },
          },
        });

        loadResources({
          action: { kind: "std" },
          direction,
          look,
          actions: {
            item: { kind: "drk", item: additional.item },
          },
        });
      }

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

    const awaitedFiles = new Map<string, HitTexture>(awaitedEntries);

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
