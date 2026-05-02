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
export const officeSpawnPoint = { x: 8, y: 19 };

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
    createOfficeObject(officeId, userId, "wall", "office_kanban_board", 11, 2, 1),
    createOfficeObject(officeId, userId, "wall", "office_whiteboard", 17, 2, 1),
    createOfficeObject(officeId, userId, "wall", "office_chart_board", 23, 2, 1),
    createOfficeObject(officeId, userId, "wall", "building_power_cable", 31, 3, 1),

    createOfficeObject(officeId, userId, "floor", "office_rug_teal", 6, 18, 1),
    createOfficeObject(officeId, userId, "desk", "office_desk_basic", 10, 16, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_teal", 11, 18, 2),
    createOfficeObject(officeId, userId, "plant", "office_plant_square", 14, 18, 2),
    createOfficeObject(officeId, userId, "plant", "office_plant_small_pot", 4, 17, 2),

    createOfficeObject(officeId, userId, "desk", "office_desk_monitor", 13, 7, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_black", 14, 9, 2),
    createOfficeObject(officeId, userId, "desk", "office_desk_dual_terminal", 19, 7, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_teal", 21, 9, 2),
    createOfficeObject(officeId, userId, "desk", "office_desk_basic", 25, 7, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_blue", 26, 9, 2),
    createOfficeObject(officeId, userId, "floor", "office_rug_beige", 17, 11, 1),
    createOfficeObject(officeId, userId, "plant", "office_plant_tall", 10, 10, 2),

    createOfficeObject(officeId, userId, "terminal", "office_server_rack", 29, 4, 2),
    createOfficeObject(officeId, userId, "terminal", "office_server_rack", 32, 4, 2),
    createOfficeObject(officeId, userId, "terminal", "office_automation_command_center", 27, 8, 2),
    createOfficeObject(officeId, userId, "terminal", "office_retro_terminal", 34, 8, 2),
    createOfficeObject(officeId, userId, "desk", "office_desk_monitor", 30, 12, 2),
    createOfficeObject(officeId, userId, "chair", "office_chair_black", 31, 14, 2),

    createOfficeObject(officeId, userId, "floor", "office_rug_red", 27, 17, 1),
    createOfficeObject(officeId, userId, "lounge", "office_sofa_teal", 27, 17, 2),
    createOfficeObject(officeId, userId, "lounge", "office_drawer_small", 31, 18, 2),
    createOfficeObject(officeId, userId, "lounge", "office_armchair_beige", 33, 17, 2),
    createOfficeObject(officeId, userId, "plant", "office_plant_round", 35, 17, 2),
    createOfficeObject(officeId, userId, "plant", "office_plant_tall", 35, 20, 2),

    createOfficeObject(officeId, userId, "interactive", "office_editor_wardrobe", 35, 12, 2),
    createOfficeObject(officeId, userId, "storage", "office_bookshelf_low", 4, 4, 2),
    createOfficeObject(officeId, userId, "storage", "office_file_cabinet_gray", 8, 4, 2),
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
