"use client";

import { useEffect, useRef } from "react";

import { assetDefinitions, getAssetDefinition, getAvatarDefinition } from "@/lib/assets";
import {
  avatarFrameRanges,
  resolveFacingDirection,
  type FacingDirection,
} from "@/lib/office-direction";
import { gridToPixel, officeSpawnPoint } from "@/lib/office";
import type { OfficeState } from "@/lib/types";

type OfficeSceneProps = {
  state: OfficeState;
};

const tileSize = 16;
const scale = 3;
const minViewportWidth = 360;
const minViewportHeight = 360;

export function OfficeScene({ state }: OfficeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: {
      destroy: (removeCanvas: boolean) => void;
      scale: { resize: (width: number, height: number) => void };
      scene: { getScene: (key: string) => unknown };
    } | null = null;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    async function start() {
      const Phaser = await import("phaser");

      if (!containerRef.current || cancelled) {
        return;
      }

      containerRef.current.innerHTML = "";

      const avatar = getAvatarDefinition(state.profile.avatar_id);
      const getContainerSize = () => {
        const rect = containerRef.current?.getBoundingClientRect();

        return {
          width: Math.max(minViewportWidth, Math.floor(rect?.width ?? minViewportWidth)),
          height: Math.max(minViewportHeight, Math.floor(rect?.height ?? minViewportHeight)),
        };
      };
      const initialSize = getContainerSize();
      const worldWidth = state.office.width * tileSize * scale;
      const worldHeight = state.office.height * tileSize * scale;

      class OfficePhaserScene extends Phaser.Scene {
        private player?: Phaser.GameObjects.Sprite;
        private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
        private keys?: Record<string, Phaser.Input.Keyboard.Key>;
        private solidRects: Phaser.Geom.Rectangle[] = [];
        private hudText?: Phaser.GameObjects.Text;
        private lastDirection: FacingDirection = "down";

        constructor() {
          super("office");
        }

        preload() {
          this.load.spritesheet("avatar-idle-sheet", avatar.src, {
            frameWidth: avatar.frame.width,
            frameHeight: avatar.frame.height,
          });
          this.load.spritesheet("avatar-run-sheet", avatar.runSrc, {
            frameWidth: avatar.frame.width,
            frameHeight: avatar.frame.height,
          });
          this.load.image(
            "interiors",
            "/assets/modern-tiles-free/interiors/Interiors_free_16x16.png",
          );
        }

        create() {
          this.cameras.main.setBackgroundColor("#182432");
          this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
          this.registerInteriorFrames();
          this.renderRoom();
          this.renderObjects();
          this.createPlayer();
          this.createInput();
          this.createSceneHud();
          this.resizeViewport(this.scale.width, this.scale.height);
        }

        update(_time: number, delta: number) {
          if (!this.player || !this.cursors || !this.keys) {
            return;
          }

          const left = this.cursors.left.isDown || this.keys.A.isDown;
          const right = this.cursors.right.isDown || this.keys.D.isDown;
          const up = this.cursors.up.isDown || this.keys.W.isDown;
          const down = this.cursors.down.isDown || this.keys.S.isDown;
          const dx = Number(right) - Number(left);
          const dy = Number(down) - Number(up);
          const moving = dx !== 0 || dy !== 0;
          const direction = resolveFacingDirection({ dx, dy }, this.lastDirection);
          this.lastDirection = direction;

          if (!moving) {
            this.player.play(`avatar-idle-${this.lastDirection}`, true);
            return;
          }

          const length = Math.hypot(dx, dy) || 1;
          const speed = 145;
          const nextX = this.player.x + (dx / length) * speed * (delta / 1000);
          const nextY = this.player.y + (dy / length) * speed * (delta / 1000);

          if (this.canStandAt(nextX, nextY)) {
            this.player.setPosition(nextX, nextY);
          }

          this.player.setDepth(this.player.y + 20);
          this.updateSceneHud();
          this.player.play(`avatar-run-${this.lastDirection}`, true);
        }

        private registerInteriorFrames() {
          const texture = this.textures.get("interiors");

          for (const asset of assetDefinitions) {
            if (asset.src.includes("/interiors/Interiors_free_16x16.png") && asset.frame) {
              if (!texture.has(asset.key)) {
                texture.add(
                  asset.key,
                  0,
                  asset.frame.x,
                  asset.frame.y,
                  asset.frame.w,
                  asset.frame.h,
                );
              }
            }
          }
        }

        private renderRoom() {
          const graphics = this.add.graphics();

          graphics.fillStyle(0x203142, 1);
          graphics.fillRect(0, 0, worldWidth, worldHeight);

          for (let y = 1; y < state.office.height - 1; y += 1) {
            for (let x = 1; x < state.office.width - 1; x += 1) {
              const pixel = gridToPixel({ x, y }, tileSize, scale);
              const checker = (x + y) % 2 === 0;
              graphics.fillStyle(checker ? 0xf7e7b8 : 0xefd99b, 1);
              graphics.fillRect(pixel.x, pixel.y, tileSize * scale, tileSize * scale);
              graphics.lineStyle(1, 0xd3bd7b, 0.45);
              graphics.strokeRect(pixel.x, pixel.y, tileSize * scale, tileSize * scale);
            }
          }

          graphics.fillStyle(0x5f7c74, 1);
          graphics.fillRect(0, 0, worldWidth, tileSize * scale);
          graphics.fillRect(0, 0, tileSize * scale, worldHeight);
          graphics.fillRect(0, worldHeight - tileSize * scale, worldWidth, tileSize * scale);
          graphics.fillRect(worldWidth - tileSize * scale, 0, tileSize * scale, worldHeight);

          graphics.fillStyle(0xf8c85f, 1);
          graphics.fillRect(tileSize * scale * 2, tileSize * scale * 2, worldWidth - tileSize * scale * 4, 8);
          graphics.fillStyle(0x24313f, 1);
          graphics.fillRoundedRect(tileSize * scale * 3, tileSize * scale * 3, 240, 34, 4);
          this.add.text(tileSize * scale * 3 + 12, tileSize * scale * 3 + 8, "OFFICEVERSE OPS", {
            color: "#fff8df",
            fontFamily: "Arial",
            fontSize: "16px",
            fontStyle: "bold",
          });

          this.solidRects.push(
            new Phaser.Geom.Rectangle(0, 0, worldWidth, tileSize * scale),
            new Phaser.Geom.Rectangle(0, 0, tileSize * scale, worldHeight),
            new Phaser.Geom.Rectangle(0, worldHeight - tileSize * scale, worldWidth, tileSize * scale),
            new Phaser.Geom.Rectangle(worldWidth - tileSize * scale, 0, tileSize * scale, worldHeight),
          );
        }

        private renderObjects() {
          for (const object of state.objects) {
            const asset = getAssetDefinition(object.asset_key);

            if (!asset?.frame) {
              continue;
            }

            const pixel = gridToPixel({ x: object.x, y: object.y }, tileSize, scale);
            const image = this.add
              .image(pixel.x, pixel.y, "interiors", asset.key)
              .setOrigin(0)
              .setScale(scale)
              .setDepth(pixel.y + asset.frame.h * scale);

            if (asset.category === "floor") {
              image.setDepth(pixel.y - 4);
            }

            if (asset.category === "wall") {
              image.setDepth(pixel.y + 2);
            }

            if (asset.collidable) {
              const width = (asset.gridSize?.w ?? 1) * tileSize * scale;
              const height = (asset.gridSize?.h ?? 1) * tileSize * scale;
              this.solidRects.push(new Phaser.Geom.Rectangle(pixel.x, pixel.y, width, height));
            }

            if (asset.interactive) {
              this.add
                .rectangle(
                  pixel.x + (asset.frame.w * scale) / 2,
                  pixel.y + (asset.frame.h * scale) / 2,
                  asset.frame.w * scale + 12,
                  asset.frame.h * scale + 12,
                )
                .setStrokeStyle(3, 0xf8c85f, 0.95)
                .setDepth(pixel.y + asset.frame.h * scale - 1);

              this.tweens.add({
                targets: image,
                alpha: 0.72,
                duration: 700,
                yoyo: true,
                repeat: -1,
              });
              image.setInteractive({ useHandCursor: true });
              image.on("pointerdown", () => {
                this.add
                  .text(pixel.x - 16, pixel.y - 28, "Editor pronto", {
                    color: "#1f2937",
                    backgroundColor: "#f8c85f",
                    padding: { x: 8, y: 4 },
                    fontFamily: "Arial",
                    fontSize: "14px",
                    fontStyle: "bold",
                  })
                  .setDepth(5000);
              });
            }
          }

          this.renderAmbientHighlights();
        }

        private renderAmbientHighlights() {
          const graphics = this.add.graphics();
          graphics.setDepth(1);
          graphics.fillStyle(0x2f8c84, 1);
          graphics.fillRoundedRect(18 * tileSize * scale, 10 * tileSize * scale, 150, 36, 8);
          graphics.fillStyle(0xf8c85f, 1);
          graphics.fillRoundedRect(18 * tileSize * scale + 12, 10 * tileSize * scale + 9, 126, 18, 5);
        }

        private createPlayer() {
          for (const [direction, range] of Object.entries(avatarFrameRanges)) {
            this.anims.create({
              key: `avatar-idle-${direction}`,
              frames: this.anims.generateFrameNumbers("avatar-idle-sheet", range),
              frameRate: 8,
              repeat: -1,
            });
            this.anims.create({
              key: `avatar-run-${direction}`,
              frames: this.anims.generateFrameNumbers("avatar-run-sheet", range),
              frameRate: 12,
              repeat: -1,
            });
          }

          const start = gridToPixel(officeSpawnPoint, tileSize, scale);
          this.player = this.add
            .sprite(start.x, start.y, "avatar-idle-sheet")
            .setOrigin(0.5, 1)
            .setScale(scale)
            .setDepth(start.y)
            .play("avatar-idle-down");
          this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
        }

        private createSceneHud() {
          this.hudText = this.add
            .text(16, 16, "", {
              color: "#fff8df",
              backgroundColor: "#24313f",
              padding: { x: 10, y: 7 },
              fontFamily: "Arial",
              fontSize: "14px",
              fontStyle: "bold",
            })
            .setScrollFactor(0)
            .setDepth(10000);
          this.updateSceneHud();
        }

        private updateSceneHud() {
          if (!this.hudText || !this.player) {
            return;
          }

          const gridX = Math.round(this.player.x / (tileSize * scale));
          const gridY = Math.round(this.player.y / (tileSize * scale));
          this.hudText.setText(`WASD | Camara follow | ${gridX},${gridY}`);
        }

        private createInput() {
          this.cursors = this.input.keyboard?.createCursorKeys();
          this.keys = this.input.keyboard?.addKeys("W,A,S,D") as Record<
            string,
            Phaser.Input.Keyboard.Key
          >;
          this.input.keyboard?.addCapture(["UP", "DOWN", "LEFT", "RIGHT", "W", "A", "S", "D"]);
        }

        private canStandAt(x: number, y: number) {
          const foot = new Phaser.Geom.Rectangle(x - 10, y - 10, 20, 10);
          return !this.solidRects.some((rect) => Phaser.Geom.Intersects.RectangleToRectangle(foot, rect));
        }

        resizeViewport(width: number, height: number) {
          this.cameras.main.setSize(width, height);
          this.cameras.main.setZoom(1);
          this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        }
      }

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: initialSize.width,
        height: initialSize.height,
        parent: containerRef.current,
        pixelArt: true,
        backgroundColor: "#182432",
        scene: OfficePhaserScene,
        scale: {
          mode: Phaser.Scale.NONE,
        },
      });

      resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry || !game) {
          return;
        }

        const width = Math.max(minViewportWidth, Math.floor(entry.contentRect.width));
        const height = Math.max(minViewportHeight, Math.floor(entry.contentRect.height));
        game.scale.resize(width, height);
        const scene = game.scene.getScene("office") as
          | (Phaser.Scene & { resizeViewport?: (width: number, height: number) => void })
          | undefined;
        scene?.resizeViewport?.(width, height);
      });
      resizeObserver.observe(containerRef.current);
    }

    start();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      game?.destroy(true);
    };
  }, [state]);

  return (
    <div className="h-full w-full overflow-hidden border-stone-900 bg-[#24313f] md:border-r-2">
      <div ref={containerRef} className="h-full w-full overflow-hidden" />
    </div>
  );
}
