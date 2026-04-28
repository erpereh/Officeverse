import { getAssetDefinition } from "@/lib/assets";
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

export const defaultOfficeWidth = 40;
export const defaultOfficeHeight = 24;
export const officeSpawnPoint = { x: 19, y: 12 };

export function fitMapToViewport(
  viewport: { width: number; height: number },
  world: { width: number; height: number },
) {
  const zoom = Math.min(viewport.width / world.width, viewport.height / world.height);
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  const displayWidth = world.width * safeZoom;
  const displayHeight = world.height * safeZoom;

  return {
    zoom: safeZoom,
    offsetX: (viewport.width - displayWidth) / 2,
    offsetY: (viewport.height - displayHeight) / 2,
    displayWidth,
    displayHeight,
  };
}

export function createDefaultOfficeObjects(
  officeId: string,
  userId: string,
): OfficeObject[] {
  return [
    createOfficeObject(officeId, userId, "wall", "task_board", 4, 2, 1),
    createOfficeObject(officeId, userId, "wall", "wall_board", 12, 2, 1),
    createOfficeObject(officeId, userId, "wall", "wall_map", 29, 2, 1),
    createOfficeObject(officeId, userId, "storage", "bookshelf_basic", 3, 4, 2),
    createOfficeObject(officeId, userId, "storage", "file_cabinet", 7, 4, 2),
    createOfficeObject(officeId, userId, "storage", "bookshelf_basic", 11, 4, 2),
    createOfficeObject(officeId, userId, "storage", "file_cabinet", 33, 4, 2),
    createOfficeObject(officeId, userId, "interactive", "wardrobe_editor", 36, 4, 2),
    createOfficeObject(officeId, userId, "desk", "desk_corner", 4, 8, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_blue", 6, 10, 2),
    createOfficeObject(officeId, userId, "desk", "desk_basic", 10, 8, 2),
    createOfficeObject(officeId, userId, "chair", "chair_basic", 11, 9, 2),
    createOfficeObject(officeId, userId, "terminal", "terminal_workstation", 15, 7, 2),
    createOfficeObject(officeId, userId, "desk", "desk_wide", 4, 14, 2),
    createOfficeObject(officeId, userId, "chair", "chair_basic", 5, 16, 2),
    createOfficeObject(officeId, userId, "desk", "desk_basic", 10, 15, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_blue", 11, 17, 2),
    createOfficeObject(officeId, userId, "plant", "plant_basic", 2, 11, 2),
    createOfficeObject(officeId, userId, "plant", "plant_basic", 14, 16, 2),
    createOfficeObject(officeId, userId, "rug", "arcade_rug", 25, 8, 1),
    createOfficeObject(officeId, userId, "meeting", "meeting_table", 27, 9, 2),
    createOfficeObject(officeId, userId, "chair", "chair_basic", 26, 8, 2),
    createOfficeObject(officeId, userId, "chair", "chair_basic", 31, 8, 2),
    createOfficeObject(officeId, userId, "chair", "chair_basic", 26, 12, 2),
    createOfficeObject(officeId, userId, "chair", "chair_basic", 31, 12, 2),
    createOfficeObject(officeId, userId, "terminal", "terminal_workstation", 34, 10, 2),
    createOfficeObject(officeId, userId, "rug", "large_rug", 4, 19, 1),
    createOfficeObject(officeId, userId, "lounge", "sofa_lounge", 4, 20, 2),
    createOfficeObject(officeId, userId, "lounge", "coffee_table", 11, 20, 2),
    createOfficeObject(officeId, userId, "plant", "plant_basic", 2, 20, 2),
    createOfficeObject(officeId, userId, "storage", "stacked_boxes", 17, 20, 2),
    createOfficeObject(officeId, userId, "storage", "file_cabinet", 21, 20, 2),
    createOfficeObject(officeId, userId, "storage", "bookshelf_wide", 25, 19, 2),
    createOfficeObject(officeId, userId, "storage", "stacked_boxes", 33, 20, 2),
    createOfficeObject(officeId, userId, "plant", "plant_basic", 37, 19, 2),
    createOfficeObject(officeId, userId, "desk", "desk_basic", 22, 15, 2),
    createOfficeObject(officeId, userId, "chair", "chair_basic", 23, 17, 2),
    createOfficeObject(officeId, userId, "desk", "desk_corner", 31, 15, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_blue", 33, 17, 2),
  ];
}

export function createEmptyOfficeObjects(): OfficeObject[] {
  return [];
}

export function clampGridPosition(
  point: GridPoint,
  width: number,
  height: number,
  margin = 1,
) {
  return {
    x: Math.min(Math.max(point.x, margin), width - margin),
    y: Math.min(Math.max(point.y, margin), height - margin),
  };
}

export function isGridBlocked(point: GridPoint, objects: OfficeObject[]) {
  return objects.some((object) => {
    const asset = getAssetDefinition(object.asset_key);

    if (
      object.layer < 2 ||
      object.asset_key === "arcade_rug" ||
      object.asset_key === "large_rug" ||
      asset?.category === "wall"
    ) {
      return false;
    }

    const w = Number(object.metadata?.grid_w ?? 1);
    const h = Number(object.metadata?.grid_h ?? 1);

    return (
      point.x >= object.x &&
      point.x < object.x + w &&
      point.y >= object.y &&
      point.y < object.y + h
    );
  });
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
  const asset = getAssetDefinition(assetKey);

  return {
    office_id: officeId,
    user_id: userId,
    object_type: objectType,
    asset_key: assetKey,
    x,
    y,
    rotation: 0,
    layer,
    metadata: {
      grid_w: asset?.gridSize?.w ?? 1,
      grid_h: asset?.gridSize?.h ?? 1,
    },
  };
}
