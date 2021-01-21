import { FigureMapData } from "../../objects/avatar/util/data/FigureMapData";
import * as path from "path";
import Bluebird from "bluebird";
import * as readline from "readline";

import {
  downloadFile,
  DownloadFileResult,
  DownloadRequest,
} from "./downloadFile";
import {
  downloadFileWithMessage,
  getDownloadMessage,
} from "./downloadFileWithMessage";
import { Logger } from "./Logger";
import { downloadMultipleFiles } from "./downloadMultipleFiles";

export async function downloadFigures(
  {
    file,
    downloadPath,
    gordonUrl,
  }: {
    downloadPath: string;
    file: DownloadFileResult;
    gordonUrl: string;
  },
  logger: Logger
) {
  if (file.type !== "SUCCESS") return;

  const text = await file.text();
  const figureMap = new FigureMapData(text);
  const libraries = figureMap.getLibraries();

  return downloadMultipleFiles(
    {
      data: libraries,
      concurrency: 30,
      logger,
      name: "Figure Libraries",
    },
    async (library, view) => {
      const request: DownloadRequest = {
        url: `${gordonUrl}/${library}.swf`,
        savePath: path.join(downloadPath, `figure`, `${library}.swf`),
      };

      const result = await downloadFile(request);
      switch (result.type) {
        case "SUCCESS":
          view.reportSuccess(library);
          break;

        case "HTTP_ERROR":
        case "FAILED_TO_WRITE":
          view.reportError(library, request, result);
          break;
      }
    }
  );
}
