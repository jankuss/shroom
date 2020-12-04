export type GetDrawOrder = (
  action: string,
  direction: string
) => string[] | undefined;

export function parseDrawOrder(
  drawOrderXml: any
): { getDrawOrder: GetDrawOrder } {
  const actionMap = new Map<string, Map<string, string[]>>();
  drawOrderXml.actionSet.action.forEach((action: any) => {
    const directionMap = new Map<string, any>();

    action.direction.forEach((direction: any) => {
      directionMap.set(
        direction["$"].id,
        direction.partList[0].part.map((part: any) => part["$"]["set-type"])
      );
    });

    actionMap.set(action["$"].id, directionMap);
  });

  return {
    getDrawOrder: (action: string, direction: string) => {
      const directions = actionMap.get(action);
      if (!directions) return;

      return directions.get(direction);
    },
  };
}
