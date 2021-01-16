import path from "path";
import { string } from "yargs";
import { FurnitureData } from "../../objects/furniture/FurnitureData";
import {
  downloadFile,
  DownloadFileResult,
  DownloadRequest,
} from "./downloadFile";
import { downloadMultipleFiles } from "./downloadMultipleFiles";
import { Logger } from "./Logger";

export async function downloadFurnitures(
  {
    downloadPath,
    hofFurniUrl,
    file,
  }: {
    downloadPath: string;
    hofFurniUrl: string;
    file: DownloadFileResult;
  },
  logger: Logger
) {
  if (file.type !== "SUCCESS") {
    logger.info(
      "Skipping downloading furniture, since we couldn't download the furniture data."
    );
    return;
  }

  const furniData = new FurnitureData(() => file.text());
  const infos = await furniData.getInfos();

  const furnitureRequests = infos.map(([key, info]) => {
    return {
      type: key.split("*")[0],
      revision: info.revision,
    };
  });

  const downloadingTypes = new Set<string>();
  const furnitureRequestsDeduplicated: {
    type: string;
    revision: number | undefined;
  }[] = [];

  furnitureRequests.forEach((element) => {
    const downloadId = `${element.revision}/${element.type}`;

    if (downloadingTypes.has(downloadId)) return;
    downloadingTypes.add(downloadId);

    furnitureRequestsDeduplicated.push(element);
  });

  await downloadMultipleFiles(
    {
      data: furnitureRequestsDeduplicated,
      concurrency: 30,
      logger,
      name: "Furnitures",
    },
    async (element, view) => {
      const swfPath =
        element.revision != null
          ? `${element.revision}/${element.type}.swf`
          : `${element.type}.swf`;

      const request: DownloadRequest = {
        url: `${hofFurniUrl}${swfPath}`,
        savePath: path.join(downloadPath, "hof_furni", swfPath),
      };

      const id = `Revision: ${element.revision ?? "-"}, Type: ${element.type}`;
      const result = await downloadFile(request);
      switch (result.type) {
        case "SUCCESS":
          if (element.revision != null) {
            view.reportSuccess(id);
          } else {
            view.reportSuccess(id);
          }
          break;

        case "FAILED_TO_WRITE":
        case "HTTP_ERROR":
          view.reportError(id, request, result);
          break;
      }
    }
  );
}
