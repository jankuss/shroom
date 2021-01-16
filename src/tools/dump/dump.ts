import { getExternalVariableUrls } from "./getExternalVariableUrls";
import { version } from "../../../package.json";
import { downloadAllFiles } from "./downloadAllFiles";
import { Logger } from "./Logger";
import { promisify } from "util";
import g from "glob";
import { extractSwfs } from "./extractSwfs";
import { promises as fs } from "fs";
import { FigureMapData } from "../../objects/avatar/util/data/FigureMapData";
import { createOffsetFile } from "./createOffsetFile";

export const glob = promisify(g);

const separator = "=========================================";

const doNothing = () => {
  // Do nothing
};

const logger: Logger = {
  debug: doNothing,
  error: console.error.bind(console),
  info: console.info.bind(console),
  log: console.info.bind(console),
};

export async function dump({ externalVariables, downloadPath }: Options) {
  console.log(separator);
  console.log("Shroom Asset Dumper for Version", version);
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

    await extractSwfs(logger, "Furniture", furnitureSwfs);

    const figureSwfs = await glob(`${downloadPath}/figure/**/*.swf`);
    console.log(
      `Found ${figureSwfs.length} figure swfs. Starting the extraction process.`
    );

    await extractSwfs(logger, "Figure", figureSwfs);
  });

  await step("Post Processing", async () => {
    console.log("Dumping offsets of figures");
    const figureMapText = await fs.readFile(
      `${downloadPath}/figuremap.xml`,
      "utf-8"
    );
    const figureMap = new FigureMapData(figureMapText);

    await createOffsetFile(downloadPath, figureMap, logger);
  });
}

interface Options {
  externalVariables?: string;
  downloadPath: string;
}
