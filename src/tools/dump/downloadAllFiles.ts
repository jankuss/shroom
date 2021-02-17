import path from "path";
import { downloadEffects } from "./downloadEffects";
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
    effectMapUrl,
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

  const effectMap = await downloadFileWithMessage(
    { url: effectMapUrl, savePath: path.join(downloadPath, "effectmap.xml") },
    logger
  );

  await downloadFigures({ gordonUrl, file: figureMap, downloadPath }, logger);
  await downloadFurnitures(
    { downloadPath, file: furniData, hofFurniUrl },
    logger
  );
  await downloadEffects(
    { gordonUrl, downloadPath, effectMapDownload: effectMap },
    logger
  );
}
