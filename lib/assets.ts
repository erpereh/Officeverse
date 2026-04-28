import type { AssetDefinition, AvatarDefinition } from "@/lib/types";

const characterPath = "/assets/modern-tiles-free/characters";
const interiorsPath = "/assets/modern-tiles-free/interiors";

export const avatarDefinitions: AvatarDefinition[] = [
  {
    id: "adam",
    name: "Adam",
    src: `${characterPath}/Adam_idle_anim_16x16.png`,
    frame: { width: 16, height: 32 },
  },
  {
    id: "alex",
    name: "Alex",
    src: `${characterPath}/Alex_idle_anim_16x16.png`,
    frame: { width: 16, height: 32 },
  },
  {
    id: "amelia",
    name: "Amelia",
    src: `${characterPath}/Amelia_idle_anim_16x16.png`,
    frame: { width: 16, height: 32 },
  },
  {
    id: "bob",
    name: "Bob",
    src: `${characterPath}/Bob_idle_anim_16x16.png`,
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
  {
    key: "desk_basic",
    name: "Mesa de trabajo",
    category: "furniture",
    src: `${interiorsPath}/Interiors_free_16x16.png`,
    frame: { x: 16, y: 48, w: 32, h: 16 },
    gridSize: { w: 2, h: 1 },
    collidable: true,
  },
  {
    key: "chair_basic",
    name: "Silla",
    category: "furniture",
    src: `${interiorsPath}/Interiors_free_16x16.png`,
    frame: { x: 64, y: 48, w: 16, h: 16 },
    gridSize: { w: 1, h: 1 },
    collidable: true,
  },
  {
    key: "plant_basic",
    name: "Planta",
    category: "furniture",
    src: `${interiorsPath}/Interiors_free_16x16.png`,
    frame: { x: 112, y: 96, w: 16, h: 32 },
    gridSize: { w: 1, h: 2 },
    collidable: true,
  },
  {
    key: "wardrobe_editor",
    name: "Armario",
    category: "interactive",
    src: `${interiorsPath}/Interiors_free_16x16.png`,
    frame: { x: 160, y: 112, w: 32, h: 32 },
    gridSize: { w: 2, h: 2 },
    collidable: true,
    interactive: true,
  },
];

export function getAvatarDefinition(avatarId: string | null | undefined) {
  return avatarDefinitions.find((avatar) => avatar.id === avatarId) ?? avatarDefinitions[0];
}

export function getAssetDefinition(assetKey: string) {
  return assetDefinitions.find((asset) => asset.key === assetKey);
}
