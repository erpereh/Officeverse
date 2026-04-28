"use client";

import { useEffect, useRef } from "react";

import { getAssetDefinition, getAvatarDefinition } from "@/lib/assets";
import { gridToPixel } from "@/lib/office";
import type { OfficeState } from "@/lib/types";

type OfficeSceneProps = {
  state: OfficeState;
};

const tileSize = 16;
const scale = 3;

export function OfficeScene({ state }: OfficeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: { destroy: (removeCanvas: boolean) => void } | null = null;
    let cancelled = false;

    async function start() {
      const Phaser = await import("phaser");

      if (!containerRef.current || cancelled) {
        return;
      }

      containerRef.current.innerHTML = "";

      const avatar = getAvatarDefinition(state.profile.avatar_id);
      const width = state.office.width * tileSize * scale;
      const height = state.office.height * tileSize * scale;

      class OfficePhaserScene extends Phaser.Scene {
        constructor() {
          super("office");
        }

        preload() {
          this.load.spritesheet("avatar", avatar.src, {
            frameWidth: avatar.frame.width,
            frameHeight: avatar.frame.height,
          });
          this.load.image(
            "interiors",
            "/assets/modern-tiles-free/interiors/Interiors_free_16x16.png",
          );
        }

        create() {
          this.cameras.main.setBackgroundColor("#eef1e6");
          this.renderFloor();
          this.renderObjects();
          this.renderAvatar();
        }

        renderFloor() {
          const graphics = this.add.graphics();

          for (let y = 0; y < state.office.height; y += 1) {
            for (let x = 0; x < state.office.width; x += 1) {
              const pixel = gridToPixel({ x, y }, tileSize, scale);
              const checker = (x + y) % 2 === 0;
              graphics.fillStyle(checker ? 0xf8f1d8 : 0xf3e8c9, 1);
              graphics.fillRect(pixel.x, pixel.y, tileSize * scale, tileSize * scale);
              graphics.lineStyle(1, 0xd9cfb4, 0.55);
              graphics.strokeRect(pixel.x, pixel.y, tileSize * scale, tileSize * scale);
            }
          }

          graphics.fillStyle(0xc8d7d0, 1);
          graphics.fillRect(0, 0, width, tileSize * scale);
          graphics.fillRect(0, 0, tileSize * scale, height);
          graphics.fillRect(0, height - tileSize * scale, width, tileSize * scale);
          graphics.fillRect(width - tileSize * scale, 0, tileSize * scale, height);
        }

        renderObjects() {
          for (const object of state.objects) {
            const asset = getAssetDefinition(object.asset_key);

            if (!asset?.frame) {
              continue;
            }

            const pixel = gridToPixel({ x: object.x, y: object.y }, tileSize, scale);
            const image = this.add
              .image(pixel.x, pixel.y, "interiors")
              .setOrigin(0)
              .setScale(scale)
              .setCrop(asset.frame.x, asset.frame.y, asset.frame.w, asset.frame.h);

            if (asset.interactive) {
              image.setInteractive({ useHandCursor: true });
              image.on("pointerdown", () => {
                this.add
                  .text(pixel.x, pixel.y - 28, "Editor pronto", {
                    color: "#1f2937",
                    backgroundColor: "#ffffff",
                    padding: { x: 8, y: 4 },
                    fontFamily: "Arial",
                    fontSize: "14px",
                  })
                  .setDepth(10);
              });
            }
          }
        }

        renderAvatar() {
          const pixel = gridToPixel({ x: 14, y: 11 }, tileSize, scale);
          this.anims.create({
            key: "avatar-idle",
            frames: this.anims.generateFrameNumbers("avatar", { start: 0, end: 23 }),
            frameRate: 8,
            repeat: -1,
          });

          this.add
            .sprite(pixel.x, pixel.y, "avatar")
            .setOrigin(0, 1)
            .setScale(scale)
            .play("avatar-idle");
        }
      }

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width,
        height,
        parent: containerRef.current,
        pixelArt: true,
        backgroundColor: "#eef1e6",
        scene: OfficePhaserScene,
      });
    }

    start();

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, [state]);

  return (
    <div className="inline-block rounded-md border bg-card p-3 shadow-sm">
      <div ref={containerRef} className="overflow-hidden rounded-md" />
    </div>
  );
}
