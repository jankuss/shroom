import Bluebird from "bluebird";
import { basename } from "path";
import { ProgressBar } from "./ProgressBar";
import { dumpSwf, OnAfterCallback } from "./dumpSwf";
import { Logger } from "./Logger";

export async function extractSwfs(
  logger: Logger,
  name: string,
  swfs: string[],
  onAfter: OnAfterCallback
) {
  const dumpFurnitureProgress = new ProgressBar(
    logger,
    swfs.length,
    (current, count, extra) => {
      if (extra != null) {
        return `Extracting ${name}: ${current} / ${count} (${extra})`;
      } else {
        return `Extracting ${name}: ${current} / ${count}`;
      }
    }
  );

  await Bluebird.map(
    swfs,
    async (path) => {
      await dumpSwf(path, onAfter);
      dumpFurnitureProgress.increment(basename(path));
    },
    {
      concurrency: 4,
    }
  );

  dumpFurnitureProgress.done();
}
