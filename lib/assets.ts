import type { AssetDefinition, AvatarDefinition } from "@/lib/types";
import officeSpritesManifest from "@/public/assets/officeverse/interiors/office-sprites.manifest.json";

const characterPath = "/assets/modern-tiles-free/characters";
const interiorsPath = "/assets/modern-tiles-free/interiors";

const officeSpriteAssets = officeSpritesManifest.assets.map((asset) => ({
  ...asset,
  category: asset.category as AssetDefinition["category"],
})) satisfies AssetDefinition[];

export const avatarDefinitions: AvatarDefinition[] = [
  {
    id: "adam",
    name: "Adam",
    src: `${characterPath}/Adam_idle_anim_16x16.png`,
    runSrc: `${characterPath}/Adam_run_16x16.png`,
    color: "#8fb34f",
    role: "Analista de hojas",
    frame: { width: 16, height: 32 },
  },
  {
    id: "alex",
    name: "Alex",
    src: `${characterPath}/Alex_idle_anim_16x16.png`,
    runSrc: `${characterPath}/Alex_run_16x16.png`,
    color: "#d59b63",
    role: "Operador de flujos",
    frame: { width: 16, height: 32 },
  },
  {
    id: "amelia",
    name: "Amelia",
    src: `${characterPath}/Amelia_idle_anim_16x16.png`,
    runSrc: `${characterPath}/Amelia_run_16x16.png`,
    color: "#b98374",
    role: "Curadora de informes",
    frame: { width: 16, height: 32 },
  },
  {
    id: "bob",
    name: "Bob",
    src: `${characterPath}/Bob_idle_anim_16x16.png`,
    runSrc: `${characterPath}/Bob_run_16x16.png`,
    color: "#7c9ec8",
    role: "Archivista veloz",
    frame: { width: 16, height: 32 },
  },
];

export const assetDefinitions: AssetDefinition[] = [
  ...avatarDefinitions.map((avatar) => ({
    key: `avatar_${avatar.id}`,
    name: avatar.name,
    category: "character" as const,
    src: avatar.src,
    gridSize: { w: 1, h: 2 },
  })),
  {
    key: "office_floor_01",
    name: "Suelo claro",
    category: "floor",
    src: `${interiorsPath}/Room_Builder_free_16x16.png`,
    frame: { x: 0, y: 0, w: 16, h: 16 },
    gridSize: { w: 1, h: 1 },
  },
  ...officeSpriteAssets,
];

export function getAvatarDefinition(avatarId: string | null | undefined) {
  return avatarDefinitions.find((avatar) => avatar.id === avatarId) ?? avatarDefinitions[0];
}

export function getAssetDefinition(assetKey: string) {
  return assetDefinitions.find((asset) => asset.key === assetKey);
}
