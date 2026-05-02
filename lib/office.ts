import { getAssetDefinition } from "@/lib/assets";
import type { OfficeObject } from "@/lib/types";
import debugOfficeStore from "@/data/debug-offices.json";

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
export const officeSpawnPoint = { x: 20, y: 19 };

const defaultTemplateSourceOfficeId = "00000000-0000-4000-8000-000000000101";
const excludedTemplateAssetKeys = new Set(["building_exit_arrow_sign"]);

type OfficeTemplateObject = Pick<
  OfficeObject,
  "asset_key" | "layer" | "metadata" | "object_type" | "rotation" | "x" | "y"
>;

const defaultOfficeTemplateObjects: OfficeTemplateObject[] =
  debugOfficeStore.objectsByOfficeId[defaultTemplateSourceOfficeId]
    .filter((object) => !excludedTemplateAssetKeys.has(object.asset_key))
    .map((object) => ({
      object_type: object.object_type,
      asset_key: object.asset_key,
      x: object.x,
      y: object.y,
      rotation: object.rotation ?? 0,
      layer: object.layer ?? 1,
      metadata: {
        grid_w: Number(object.metadata?.grid_w ?? 1),
        grid_h: Number(object.metadata?.grid_h ?? 1),
      },
    }));

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
  return defaultOfficeTemplateObjects.map((object) => ({
    ...object,
    office_id: officeId,
    user_id: userId,
    metadata: { ...object.metadata },
  }));
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

    const w = Number(object.metadata?.grid_w ?? asset?.gridSize?.w ?? 1);
    const h = Number(object.metadata?.grid_h ?? asset?.gridSize?.h ?? 1);

    return (
      point.x >= object.x &&
      point.x < object.x + w &&
      point.y >= object.y &&
      point.y < object.y + h
    );
  });
}
