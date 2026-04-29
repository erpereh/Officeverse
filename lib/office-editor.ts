import { getAssetDefinition } from "@/lib/assets";
import type { OfficeLayoutPayload, OfficeObject } from "@/lib/types";

type GridPoint = {
  x: number;
  y: number;
};

export type EditorTool = "delete" | "move" | "place";

export function createObjectFromAsset(
  officeId: string,
  userId: string,
  assetKey: string,
  point: GridPoint,
): OfficeObject {
  const asset = getAssetDefinition(assetKey);

  if (!asset) {
    throw new Error(`Unknown asset key: ${assetKey}`);
  }

  return {
    office_id: officeId,
    user_id: userId,
    object_type: asset.category,
    asset_key: asset.key,
    x: point.x,
    y: point.y,
    rotation: 0,
    layer: asset.category === "floor" || asset.category === "wall" ? 1 : 2,
    metadata: {
      grid_w: asset.gridSize?.w ?? 1,
      grid_h: asset.gridSize?.h ?? 1,
    },
  };
}

export function normalizeLayoutPayload(
  payload: OfficeLayoutPayload,
  bounds: { height: number; width: number },
) {
  return payload.objects.map((object) => {
    const asset = getAssetDefinition(object.asset_key);

    if (!asset) {
      throw new Error(`Asset no valido: ${object.asset_key}`);
    }

    const gridWidth = asset.gridSize?.w ?? 1;
    const gridHeight = asset.gridSize?.h ?? 1;

    if (
      object.x < 1 ||
      object.y < 1 ||
      object.x + gridWidth > bounds.width ||
      object.y + gridHeight > bounds.height
    ) {
      throw new Error(`Objeto fuera del mapa: ${asset.key}`);
    }

    return {
      object_type: asset.category,
      asset_key: asset.key,
      x: object.x,
      y: object.y,
      rotation: object.rotation ?? 0,
      layer: object.layer ?? (asset.category === "floor" || asset.category === "wall" ? 1 : 2),
      metadata: {
        grid_w: gridWidth,
        grid_h: gridHeight,
        ...(object.metadata ?? {}),
      },
    };
  });
}

export function placeObject(
  objects: OfficeObject[],
  object: OfficeObject,
) {
  return [...objects, object];
}

export function deleteObjectAt(objects: OfficeObject[], point: GridPoint) {
  const index = findTopObjectIndexAt(objects, point);

  if (index < 0) {
    return objects;
  }

  return objects.filter((_, objectIndex) => objectIndex !== index);
}

export function moveObjectAt(
  objects: OfficeObject[],
  from: GridPoint,
  to: GridPoint,
) {
  const index = findTopObjectIndexAt(objects, from);

  if (index < 0) {
    return objects;
  }

  return objects.map((object, objectIndex) =>
    objectIndex === index ? { ...object, x: to.x, y: to.y } : object,
  );
}

export function findTopObjectIndexAt(objects: OfficeObject[], point: GridPoint) {
  let match = -1;
  let matchDepth = Number.NEGATIVE_INFINITY;

  objects.forEach((object, index) => {
    const asset = getAssetDefinition(object.asset_key);
    const width = asset?.gridSize?.w ?? Number(object.metadata?.grid_w ?? 1);
    const height = asset?.gridSize?.h ?? Number(object.metadata?.grid_h ?? 1);
    const contains =
      point.x >= object.x &&
      point.x < object.x + width &&
      point.y >= object.y &&
      point.y < object.y + height;

    if (contains) {
      const depth = object.layer * 10_000 + object.y * 100 + object.x;

      if (depth >= matchDepth) {
        match = index;
        matchDepth = depth;
      }
    }
  });

  return match;
}
