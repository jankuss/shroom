import { parseString } from "xml2js";
export function parseStringAsync(str: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(str, (err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
}
