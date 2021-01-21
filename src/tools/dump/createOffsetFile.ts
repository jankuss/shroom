import path from "path";
import { IFigureMapData } from "../../objects/avatar/util/data/interfaces/IFigureMapData";
import { promises as fs } from "fs";
import { AvatarManifestData } from "../../objects/avatar/util/data/AvatarManifestData";
import { ProgressBar } from "./ProgressBar";
import { Logger } from "./Logger";

export async function createOffsetFile(
  downloadPath: string,
  figureMap: IFigureMapData,
  logger: Logger
) {
  const assets = figureMap.getLibraries();
  const object: { [key: string]: { offsetX: number; offsetY: number } } = {};
  const progress = new ProgressBar(
    logger,
    assets.length,
    (current, count, data) => {
      if (data != null) {
        return `Figure Offsets: ${current} / ${count} (${data})`;
      } else {
        return `Figure Offsets: ${current} / ${count}`;
      }
    }
  );

  for (const asset of assets) {
    const manifestPath = path.join(
      downloadPath,
      "figure",
      asset,
      "manifest.bin"
    );
    const manifestFile = await fs.readFile(manifestPath, "utf-8");
    const manifest = new AvatarManifestData(manifestFile);

    manifest.getAssets().forEach((asset) => {
      object[asset.name] = { offsetX: asset.x, offsetY: asset.y };
    });

    progress.increment(asset);
  }

  progress.done();

  await fs.writeFile(
    path.join(downloadPath, "offsets.json"),
    JSON.stringify(object)
  );
}
