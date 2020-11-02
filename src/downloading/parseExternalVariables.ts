export function parseExternalVariables(externalVars: string) {
  const lines = externalVars.split("\n");
  const map = new Map<string, string>(
    lines.map(line => line.split("=")).map(item => [item[0], item[1]])
  );

  map.forEach((replaceValue, key) => {
    map.forEach((value, okey) => {
      if (value) {
        map.set(okey, value.replace("${" + key + "}", replaceValue));
      }
    });
  });

  return map;
}
