import type { OfficeObject } from "@/lib/types";

type GridPoint = {
  x: number;
  y: number;
};

export function gridToPixel(point: GridPoint, tileSize: number, scale: number) {
  return {
    x: point.x * tileSize * scale,
    y: point.y * tileSize * scale,
  };
}

export function createDefaultOfficeObjects(
  officeId: string,
  userId: string,
): OfficeObject[] {
  return [
    createOfficeObject(officeId, userId, "desk", "desk_basic", 10, 8, 2),
    createOfficeObject(officeId, userId, "chair", "chair_basic", 11, 9, 2),
    createOfficeObject(officeId, userId, "plant", "plant_basic", 5, 6, 2),
    createOfficeObject(officeId, userId, "wardrobe", "wardrobe_editor", 24, 4, 2),
  ];
}

function createOfficeObject(
  officeId: string,
  userId: string,
  objectType: string,
  assetKey: string,
  x: number,
  y: number,
  layer: number,
): OfficeObject {
  return {
    office_id: officeId,
    user_id: userId,
    object_type: objectType,
    asset_key: assetKey,
    x,
    y,
    rotation: 0,
    layer,
    metadata: {},
  };
}
