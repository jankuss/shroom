import Bluebird from "bluebird";
import { basename } from "path";
import { ProgressBar } from "./ProgressBar";
import { dumpSwf } from "./dumpSwf";
import { Logger } from "./Logger";
import { cpus } from "os";

export async function extractSwfs(
  logger: Logger,
  name: string,
  swfs: string[]
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
      await dumpSwf(path);
      dumpFurnitureProgress.increment(basename(path));
    },
    {
      concurrency: cpus().length,
    }
  );

  dumpFurnitureProgress.done();
}
