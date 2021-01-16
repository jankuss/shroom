import {
  downloadFile,
  DownloadFileResult,
  DownloadRequest,
} from "./downloadFile";
import { Logger } from "./Logger";

export async function downloadFileWithMessage(
  request: DownloadRequest,
  logger: Logger
) {
  const downloadedFile = await downloadFile(request);
  const message = getDownloadMessage(request, downloadedFile);

  switch (downloadedFile.type) {
    case "SUCCESS":
      logger.debug(message);
      break;
    case "FAILED_TO_WRITE":
      logger.error(message);
      break;
    case "HTTP_ERROR":
      logger.error(message);
      break;
  }

  return downloadedFile;
}

export function getDownloadMessage(
  request: DownloadRequest,
  result: DownloadFileResult
) {
  switch (result.type) {
    case "SUCCESS":
      return `Downloaded - ${request.savePath}`;
    case "HTTP_ERROR":
      return `Error: Failed to download file. Status Code: ${result.code} - ${request.url}`;
    case "FAILED_TO_WRITE":
      return `Error: Failed to write - ${request.savePath}`;
    case "RETRY_FAILED":
      return `Error: Failed to download file after retrying. - ${request.url}`;
  }
}
