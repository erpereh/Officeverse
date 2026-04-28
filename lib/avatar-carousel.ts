import { avatarDefinitions } from "@/lib/assets";

export function getAvatarIndex(avatarId: string | null | undefined) {
  const index = avatarDefinitions.findIndex((avatar) => avatar.id === avatarId);
  return index >= 0 ? index : 0;
}

export function getAdjacentAvatarId(
  currentAvatarId: string | null | undefined,
  direction: "previous" | "next",
) {
  const currentIndex = getAvatarIndex(currentAvatarId);
  const offset = direction === "next" ? 1 : -1;
  const nextIndex =
    (currentIndex + offset + avatarDefinitions.length) % avatarDefinitions.length;

  return avatarDefinitions[nextIndex].id;
}
