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
    createOfficeObject(officeId, userId, "wall", "office_kanban_board", 3, 2, 1),
    createOfficeObject(officeId, userId, "wall", "office_whiteboard", 10, 2, 1),
    createOfficeObject(officeId, userId, "wall", "office_chart_board", 28, 2, 1),
    createOfficeObject(officeId, userId, "storage", "office_bookshelf_low", 3, 4, 2),
    createOfficeObject(officeId, userId, "storage", "office_cabinet_glass", 8, 4, 2),
    createOfficeObject(officeId, userId, "storage", "office_bookshelf_wide", 13, 4, 2),
    createOfficeObject(officeId, userId, "storage", "office_file_cabinet_gray", 32, 4, 2),
    createOfficeObject(officeId, userId, "interactive", "office_editor_wardrobe", 36, 4, 2),
    createOfficeObject(officeId, userId, "desk", "office_multi_monitor_station", 3, 8, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_black", 6, 11, 2),
    createOfficeObject(officeId, userId, "desk", "office_desk_monitor", 10, 8, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_teal", 12, 11, 2),
    createOfficeObject(officeId, userId, "terminal", "office_automation_command_center", 16, 7, 2),
    createOfficeObject(officeId, userId, "desk", "office_desk_basic", 4, 14, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_amber", 5, 17, 2),
    createOfficeObject(officeId, userId, "desk", "office_desk_dual_terminal", 10, 15, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_blue", 12, 18, 2),
    createOfficeObject(officeId, userId, "plant", "office_plant_tall", 2, 11, 2),
    createOfficeObject(officeId, userId, "plant", "office_plant_square", 15, 16, 2),
    createOfficeObject(officeId, userId, "rug", "office_rug_teal", 25, 8, 1),
    createOfficeObject(officeId, userId, "meeting", "office_desk_chair_corner", 27, 9, 2),
    createOfficeObject(officeId, userId, "chair", "office_waiting_chair_teal", 26, 8, 2),
    createOfficeObject(officeId, userId, "chair", "office_stool_teal", 31, 8, 2),
    createOfficeObject(officeId, userId, "chair", "office_stool_wood", 26, 12, 2),
    createOfficeObject(officeId, userId, "chair", "office_armchair_beige", 31, 12, 2),
    createOfficeObject(officeId, userId, "terminal", "office_retro_terminal", 34, 10, 2),
    createOfficeObject(officeId, userId, "rug", "office_rug_red", 4, 19, 1),
    createOfficeObject(officeId, userId, "lounge", "office_sofa_teal", 4, 20, 2),
    createOfficeObject(officeId, userId, "lounge", "office_drawer_small", 11, 20, 2),
    createOfficeObject(officeId, userId, "plant", "office_plant_round", 2, 20, 2),
    createOfficeObject(officeId, userId, "storage", "office_storage_box_large", 17, 20, 2),
    createOfficeObject(officeId, userId, "storage", "office_file_cabinet_beige", 21, 20, 2),
    createOfficeObject(officeId, userId, "storage", "office_bookshelf_plant", 25, 19, 2),
    createOfficeObject(officeId, userId, "storage", "office_storage_shelf", 33, 20, 2),
    createOfficeObject(officeId, userId, "plant", "office_plant_palm", 37, 19, 2),
    createOfficeObject(officeId, userId, "desk", "office_lamp_desk", 22, 15, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_teal", 23, 17, 2),
    createOfficeObject(officeId, userId, "desk", "office_corner_desk", 31, 15, 2),
    createOfficeObject(officeId, userId, "plant", "office_plant_table", 33, 17, 2),
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
      asset?.category === "floor" ||
      asset?.category === "wall"
    ) {
      return false;
    }

    const w = asset?.gridSize?.w ?? Number(object.metadata?.grid_w ?? 1);
    const h = asset?.gridSize?.h ?? Number(object.metadata?.grid_h ?? 1);

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
