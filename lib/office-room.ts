export type StaticRoomPlacement = {
  assetKey: string;
  depth: number;
  x: number;
  y: number;
};

export function createRoomBasePlacements(width: number, height: number): StaticRoomPlacement[] {
  const placements: StaticRoomPlacement[] = [];
  const add = (assetKey: string, x: number, y: number, depth: number) => {
    placements.push({ assetKey, x, y, depth });
  };

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const isReceptionInset = x >= 15 && x <= 24 && y >= 4 && y <= 6;
      add(isReceptionInset ? "building_floor_beige_tile" : "building_floor_blue_tile", x, y, -30);
    }
  }

  for (let x = 1; x <= width - 5; x += 4) {
    add("building_wall_panel_clean", x, 1, -20);
  }

  for (let x = 1; x <= width - 4; x += 3) {
    add("building_baseboard_blue_medium", x, 3, -15);
  }

  for (let x = 1; x <= width - 4; x += 3) {
    add("building_trim_white_long", x, height - 2, -12);
  }

  const centerX = Math.floor(width / 2);
  add("building_door_double_glass", centerX - 2, 0, -8);
  add("building_window_double", 4, 1, -9);
  add("building_window_quad", width - 9, 1, -9);
  add("building_clock_digital", centerX - 1, 1, -7);
  add("building_exit_arrow_sign", width - 6, 3, -7);

  return placements;
}
