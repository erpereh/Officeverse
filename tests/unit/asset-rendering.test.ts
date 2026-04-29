import { describe, expect, it } from "vitest";

import { fitAssetFrameToGrid, fitFrameToBox, getAssetFootprintPixels } from "@/lib/asset-rendering";
import { getAssetDefinition } from "@/lib/assets";

describe("asset rendering", () => {
  it("fits the server rack inside its 2x3 grid footprint", () => {
    const asset = getAssetDefinition("office_server_rack");

    expect(asset?.gridSize).toEqual({ w: 2, h: 3 });

    const footprint = getAssetFootprintPixels(asset!, 16, 3);
    const fit = fitAssetFrameToGrid(asset!, 16, 3);

    expect(footprint).toEqual({ width: 96, height: 144 });
    expect(fit.width).toBeLessThanOrEqual(footprint.width);
    expect(fit.height).toBeLessThanOrEqual(footprint.height);
  });

  it("keeps editor previews inside fixed UI boxes", () => {
    const asset = getAssetDefinition("office_server_rack");
    const fit = fitFrameToBox(asset!.frame!, { width: 56, height: 40 });

    expect(fit.width).toBeLessThanOrEqual(56);
    expect(fit.height).toBeLessThanOrEqual(40);
  });
});
