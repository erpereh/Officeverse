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

  createFloorFill(width, height, add);
  createWallLoop(width, height, add);
  createWallDecor(width, height, add);

  return placements;
}

function createFloorFill(
  width: number,
  height: number,
  add: (assetKey: string, x: number, y: number, depth: number) => void,
) {
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      add("building_floor_beige_tile", x, y, -30);
    }
  }
}

function createWallLoop(
  width: number,
  height: number,
  add: (assetKey: string, x: number, y: number, depth: number) => void,
) {
  for (let x = 2; x <= width - 6; x += 4) {
    add("building_wall_panel_clean", x, 1, -20);
  }

  for (let x = 2; x <= width - 4; x += 3) {
    add("building_baseboard_blue_medium", x, 3, -15);
  }

  for (let x = 2; x <= width - 4; x += 3) {
    add("building_trim_white_long", x, height - 2, -12);
  }

  for (let y = 4; y <= height - 5; y += 3) {
    add("building_wall_column", 1, y, -14);
    add("building_wall_column", width - 2, y, -14);
  }
}

function createWallDecor(
  width: number,
  height: number,
  add: (assetKey: string, x: number, y: number, depth: number) => void,
) {
  void width;
  add("building_clock_digital", 18, 1, -7);
  add("building_exit_arrow_sign", 9, height - 3, -7);
}
