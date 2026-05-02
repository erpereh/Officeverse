import { getAssetDefinition } from "@/lib/assets";
import type { AssetDefinition, OfficeLayoutPayload, OfficeObject } from "@/lib/types";

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
  rotation = 0,
): OfficeObject {
  const asset = getAssetDefinition(assetKey);

  if (!asset) {
    throw new Error(`Unknown asset key: ${assetKey}`);
  }

  const normalizedRotation = normalizeRotation(rotation);
  const gridSize = getRotatedGridSize(asset, normalizedRotation);

  return {
    office_id: officeId,
    user_id: userId,
    object_type: asset.category,
    asset_key: asset.key,
    x: point.x,
    y: point.y,
    rotation: normalizedRotation,
    layer: asset.category === "floor" || asset.category === "wall" ? 1 : 2,
    metadata: {
      grid_w: gridSize.w,
      grid_h: gridSize.h,
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

    const rotatedGridSize = getRotatedGridSize(asset, object.rotation);
    const gridWidth = Number(object.metadata?.grid_w ?? rotatedGridSize.w);
    const gridHeight = Number(object.metadata?.grid_h ?? rotatedGridSize.h);

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

export function rotateQuarterTurn(rotation: number | undefined) {
  return normalizeRotation((rotation ?? 0) + 90);
}

export function getRotatedGridSize(
  asset: Pick<AssetDefinition, "gridSize"> | null | undefined,
  rotation: number | undefined,
) {
  const width = asset?.gridSize?.w ?? 1;
  const height = asset?.gridSize?.h ?? 1;
  const normalizedRotation = normalizeRotation(rotation ?? 0);

  if (normalizedRotation === 90 || normalizedRotation === 270) {
    return { w: height, h: width };
  }

  return { w: width, h: height };
}

function normalizeRotation(rotation: number) {
  return ((rotation % 360) + 360) % 360;
}

export function findTopObjectIndexAt(objects: OfficeObject[], point: GridPoint) {
  let match = -1;
  let matchDepth = Number.NEGATIVE_INFINITY;

  objects.forEach((object, index) => {
    const asset = getAssetDefinition(object.asset_key);
    const width = Number(object.metadata?.grid_w ?? asset?.gridSize?.w ?? 1);
    const height = Number(object.metadata?.grid_h ?? asset?.gridSize?.h ?? 1);
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
