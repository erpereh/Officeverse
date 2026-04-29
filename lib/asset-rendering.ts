import type { AssetDefinition } from "@/lib/types";

export const officeSpritesPath = "/assets/officeverse/interiors/office-sprites.png";
export const officeBuildingPath = "/assets/officeverse/building/office-building.png";

export function isOfficeverseInteriorAsset(asset: Pick<AssetDefinition, "src">) {
  return asset.src === officeSpritesPath;
}

export function isOfficeverseGeneratedAsset(asset: Pick<AssetDefinition, "src">) {
  return asset.src === officeSpritesPath || asset.src === officeBuildingPath;
}

export function getAssetGridSize(asset: Pick<AssetDefinition, "gridSize">) {
  return {
    w: asset.gridSize?.w ?? 1,
    h: asset.gridSize?.h ?? 1,
  };
}

export function getAssetFootprintPixels(
  asset: Pick<AssetDefinition, "gridSize">,
  tileSize: number,
  scale: number,
) {
  const grid = getAssetGridSize(asset);

  return {
    width: grid.w * tileSize * scale,
    height: grid.h * tileSize * scale,
  };
}

export function fitFrameToBox(
  frame: { h: number; w: number },
  box: { height: number; width: number },
) {
  const frameScale = Math.min(box.width / frame.w, box.height / frame.h);
  const safeScale = Number.isFinite(frameScale) && frameScale > 0 ? frameScale : 1;

  return {
    scale: safeScale,
    width: frame.w * safeScale,
    height: frame.h * safeScale,
  };
}

export function fitAssetFrameToGrid(
  asset: Pick<AssetDefinition, "frame" | "gridSize">,
  tileSize: number,
  scale: number,
) {
  const footprint = getAssetFootprintPixels(asset, tileSize, scale);

  if (!asset.frame) {
    return {
      ...footprint,
      scale,
    };
  }

  return fitFrameToBox(asset.frame, footprint);
}
