import path from "path";
import { downloadFigures } from "./downloadFigures";
import { downloadFileWithMessage } from "./downloadFileWithMessage";
import { downloadFurnitures } from "./downloadFurnitures";
import { ExternalVariables } from "./getExternalVariableUrls";
import { Logger } from "./Logger";

export async function downloadAllFiles(
  downloadPath: string,
  {
    figureDataUrl,
    figureMapUrl,
    furniDataUrl,
    hofFurniUrl,
    gordonUrl,
  }: ExternalVariables,
  logger: Logger
) {
  await downloadFileWithMessage(
    {
      url: figureDataUrl,
      savePath: path.join(downloadPath, "figuredata.xml"),
    },
    logger
  );

  const figureMap = await downloadFileWithMessage(
    {
      url: figureMapUrl,
      savePath: path.join(downloadPath, "figuremap.xml"),
    },
    logger
  );

  const furniData = await downloadFileWithMessage(
    { url: furniDataUrl, savePath: path.join(downloadPath, "furnidata.xml") },
    logger
  );

  await downloadFigures({ gordonUrl, file: figureMap, downloadPath }, logger);
  await downloadFurnitures(
    { downloadPath, file: furniData, hofFurniUrl },
    logger
  );
}
