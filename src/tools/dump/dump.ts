import { getExternalVariableUrls } from "./getExternalVariableUrls";
import { downloadAllFiles } from "./downloadAllFiles";
import { Logger } from "./Logger";
import { promisify } from "util";
import g from "glob";
import { extractSwfs } from "./extractSwfs";
import { promises as fs } from "fs";
import { FigureMapData } from "../../objects/avatar/data/FigureMapData";
import { createOffsetFile } from "./createOffsetFile";
import { dumpFigure } from "./dumpFigure";
import { dumpFurniture } from "./dumpFurniture";

export const glob = promisify(g);

const separator = "=========================================";

const logger: Logger = console;

export async function dump({ externalVariables, downloadPath }: Options) {
  console.log(separator);
  console.log("Shroom Asset Dumper");
  console.log(separator);

  let stepCounter = 0;
  const step = async (text: string, callback: () => Promise<void>) => {
    stepCounter++;
    console.log(`${stepCounter}. Step: ${text}`);
    console.log();
    await callback();
    console.log(separator);
  };

  if (externalVariables != null) {
    const variables = await getExternalVariableUrls(externalVariables);

    await step("Download from Server", async () => {
      console.log("Found following urls in the external variables:");
      console.log("- Figure Data:", variables.figureDataUrl);
      console.log("- Figure Map:", variables.figureMapUrl);
      console.log("- Furni Data", variables.furniDataUrl);
      console.log("- Furniture:", variables.hofFurniUrl);
      console.log("- Effect Map:", variables.effectMapUrl);
      console.log("");

      await downloadAllFiles(downloadPath, variables, logger);
      console.log(`Successfully downloaded files into ${downloadPath}`);
    });
  }

  await step("Extract SWFs", async () => {
    const furnitureSwfs = await glob(`${downloadPath}/hof_furni/**/*.swf`);
    console.log(
      `Found ${furnitureSwfs.length} furniture swfs. Starting the extraction process.`
    );

    await extractSwfs(logger, "Furniture", furnitureSwfs, dumpFurniture);

    const figureSwfs = await glob(`${downloadPath}/figure/**/*.swf`);
    console.log(
      `Found ${figureSwfs.length} figure swfs. Starting the extraction process.`
    );

    await extractSwfs(logger, "Figure", figureSwfs, dumpFigure);

    const effectsSwf = await glob(`${downloadPath}/effects/**/*.swf`);
    console.log(
      `Found ${figureSwfs.length} effect swfs. Starting the extraction process.`
    );

    await extractSwfs(logger, "Effects", effectsSwf, dumpFigure);
  });
}

interface Options {
  externalVariables?: string;
  downloadPath: string;
}
