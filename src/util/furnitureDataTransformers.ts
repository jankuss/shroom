import { FurnitureInfo } from "../interfaces/IFurnitureData";

export function transformFirst<T>(
  transform: (value: string) => T,
  defaultValue: T
) {
  return (arr: string[]) => {
    const value = arr[0];
    if (value === "") return defaultValue;

    return transform(value);
  };
}

function booleanTransform(value: string) {
  return value === "1";
}

function numberTransform(value: string) {
  return Number(value);
}

function stringTransform(value: string) {
  return value;
}

export function formatFurnitureData(data: {
  [key: string]: unknown;
}): FurnitureInfo | undefined {
  const keys = Object.keys(data);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: any = {};

  keys.forEach((key) => {
    const castedKey = key as keyof typeof furnitureDataTransformers;
    const transformer = furnitureDataTransformers[castedKey];

    if (transformer != null) {
      const value = data[key] as string[];

      obj[castedKey] = transformer(value);
    }
  });

  return obj;
}

export const furnitureDataTransformers = {
  adurl: transformFirst(stringTransform, undefined),
  bc: transformFirst(booleanTransform, false),
  buyout: transformFirst(booleanTransform, false),
  canlayon: transformFirst(booleanTransform, false),
  cansiton: transformFirst(booleanTransform, false),
  canstandon: transformFirst(booleanTransform, false),
  defaultdir: transformFirst(numberTransform, 0),
  description: transformFirst(stringTransform, undefined),
  environment: transformFirst(stringTransform, undefined),
  excludeddynamic: transformFirst(booleanTransform, false),
  furniline: transformFirst(stringTransform, undefined),
  name: transformFirst(stringTransform, undefined),
  offerid: transformFirst(numberTransform, undefined),
  rare: transformFirst(booleanTransform, false),
  rentbuyout: transformFirst(booleanTransform, false),
  rentofferid: transformFirst(numberTransform, undefined),
  revision: transformFirst(numberTransform, undefined),
  specialtype: transformFirst(numberTransform, undefined),
  xdim: transformFirst(numberTransform, undefined),
  ydim: transformFirst(numberTransform, undefined),
};
