export type FacingDirection = "down" | "left" | "right" | "up";

export type DirectionVector = {
  dx: number;
  dy: number;
};

export const avatarFrameRanges: Record<FacingDirection, { start: number; end: number }> = {
  right: { start: 0, end: 5 },
  up: { start: 6, end: 11 },
  left: { start: 12, end: 17 },
  down: { start: 18, end: 23 },
};

export const frontAvatarFrame = avatarFrameRanges.down.start;

export function resolveFacingDirection(
  vector: DirectionVector,
  lastDirection: FacingDirection,
): FacingDirection {
  const { dx, dy } = vector;

  if (dx === 0 && dy === 0) {
    return lastDirection;
  }

  if (Math.abs(dy) > Math.abs(dx)) {
    return dy < 0 ? "up" : "down";
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx < 0 ? "left" : "right";
  }

  if (lastDirection === "up" || lastDirection === "down") {
    return dy < 0 ? "up" : "down";
  }

  return dx < 0 ? "left" : "right";
}
