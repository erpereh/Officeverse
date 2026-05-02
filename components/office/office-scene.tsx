"use client";

import { useEffect, useRef } from "react";

import {
  fitAssetFrameToGrid,
  getAssetFootprintPixels,
  isOfficeverseGeneratedAsset,
} from "@/lib/asset-rendering";
import { assetDefinitions, getAssetDefinition, getAvatarDefinition } from "@/lib/assets";
import {
  avatarFrameRanges,
  resolveFacingDirection,
  type FacingDirection,
} from "@/lib/office-direction";
import type { EditorTool } from "@/lib/office-editor";
import { createRoomBasePlacements } from "@/lib/office-room";
import { fitMapToViewport, gridToPixel, officeSpawnPoint } from "@/lib/office";
import type { OfficeState } from "@/lib/types";

type OfficeSceneProps = {
  editorMode?: boolean;
  editorTool?: EditorTool;
  onGridClick?: (point: { x: number; y: number }) => void;
  selectedAssetKey?: string;
  state: OfficeState;
};

type EditorSceneState = {
  enabled: boolean;
  selectedAssetKey: string;
  tool: EditorTool;
};

type OfficeSceneController = {
  setEditorState: (editorState: EditorSceneState) => void;
  setObjects: (objects: OfficeState["objects"]) => void;
};

const tileSize = 16;
const scale = 3;
const minViewportWidth = 360;
const minViewportHeight = 360;

function textureKeyForAssetSource(src: string) {
  if (src.includes("/officeverse/building/office-building.png")) {
    return "office-building";
  }

  if (src.includes("/officeverse/interiors/office-sprites.png")) {
    return "office-sprites";
  }

  if (src.includes("/interiors/Room_Builder_free_16x16.png")) {
    return "room-builder";
  }

  return "interiors";
}

export function OfficeScene({
  editorMode = false,
  editorTool = "place",
  onGridClick,
  selectedAssetKey = "desk_basic",
  state,
}: OfficeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<OfficeSceneController | null>(null);
  const editorStateRef = useRef<EditorSceneState>({
    enabled: editorMode,
    selectedAssetKey,
    tool: editorTool,
  });
  const gridClickRef = useRef(onGridClick);
  const stateRef = useRef(state);

  stateRef.current = state;
  gridClickRef.current = onGridClick;
  editorStateRef.current = { enabled: editorMode, selectedAssetKey, tool: editorTool };

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

      const initialState = stateRef.current;
      const avatar = getAvatarDefinition(initialState.profile.avatar_id);
      const getContainerSize = () => {
        const rect = containerRef.current?.getBoundingClientRect();

        return {
          width: Math.max(minViewportWidth, Math.floor(rect?.width ?? minViewportWidth)),
          height: Math.max(minViewportHeight, Math.floor(rect?.height ?? minViewportHeight)),
        };
      };
      const initialSize = getContainerSize();
      const worldWidth = initialState.office.width * tileSize * scale;
      const worldHeight = initialState.office.height * tileSize * scale;

      class OfficePhaserScene extends Phaser.Scene {
        private editorGrid?: Phaser.GameObjects.Graphics;
        private ghost?: Phaser.GameObjects.Rectangle;
        private objectGameObjects: Phaser.GameObjects.GameObject[] = [];
        private objectSolidRects: Phaser.Geom.Rectangle[] = [];
        private player?: Phaser.GameObjects.Sprite;
        private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
        private keys?: Record<string, Phaser.Input.Keyboard.Key>;
        private wallSolidRects: Phaser.Geom.Rectangle[] = [];
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
          this.load.image(
            "room-builder",
            "/assets/modern-tiles-free/interiors/Room_Builder_free_16x16.png",
          );
          this.load.image("office-sprites", "/assets/officeverse/interiors/office-sprites.png");
          this.load.image("office-building", "/assets/officeverse/building/office-building.png");
        }

        create() {
          this.cameras.main.setBackgroundColor("#211c17");
          this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
          this.registerAssetFrames();
          this.renderRoom();
          this.renderObjects();
          this.renderEditorGrid();
          this.createPlayer();
          this.createInput();
          this.createSceneHud();
          this.createEditorInput();
          controllerRef.current = {
            setEditorState: (nextEditorState) => this.setEditorState(nextEditorState),
            setObjects: (objects) => this.setObjects(objects),
          };
          this.setEditorState(editorStateRef.current);
          this.resizeViewport(this.scale.width, this.scale.height);
        }

        update(_time: number, delta: number) {
          if (!this.player || !this.cursors || !this.keys || editorStateRef.current.enabled) {
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

        private registerAssetFrames() {
          for (const asset of assetDefinitions) {
            if (asset.frame) {
              const texture = this.textures.get(textureKeyForAssetSource(asset.src));

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

          graphics.setDepth(-100);
          graphics.fillStyle(0x211c17, 1);
          graphics.fillRect(0, 0, worldWidth, worldHeight);

          const office = stateRef.current.office;

          for (const placement of createRoomBasePlacements(office.width, office.height)) {
            this.addStaticAsset(placement.assetKey, placement.x, placement.y, placement.depth);
          }

          this.wallSolidRects.push(
            new Phaser.Geom.Rectangle(0, 0, worldWidth, tileSize * scale),
            new Phaser.Geom.Rectangle(0, 0, tileSize * scale, worldHeight),
            new Phaser.Geom.Rectangle(0, worldHeight - tileSize * scale, worldWidth, tileSize * scale),
            new Phaser.Geom.Rectangle(worldWidth - tileSize * scale, 0, tileSize * scale, worldHeight),
          );
        }

        private addStaticAsset(assetKey: string, gridX: number, gridY: number, depth: number) {
          const asset = getAssetDefinition(assetKey);

          if (!asset?.frame) {
            return;
          }

          const pixel = gridToPixel({ x: gridX, y: gridY }, tileSize, scale);
          const footprint = getAssetFootprintPixels(asset, tileSize, scale);
          this.add
            .image(pixel.x, pixel.y, textureKeyForAssetSource(asset.src), asset.key)
            .setOrigin(0)
            .setDisplaySize(footprint.width, footprint.height)
            .setDepth(depth);
        }

        private renderObjects() {
          for (const gameObject of this.objectGameObjects) {
            gameObject.destroy();
          }
          this.objectGameObjects = [];
          this.objectSolidRects = [];

          for (const object of stateRef.current.objects) {
            const asset = getAssetDefinition(object.asset_key);

            if (!asset?.frame) {
              continue;
            }

            const pixel = gridToPixel({ x: object.x, y: object.y }, tileSize, scale);
            const footprint = getAssetFootprintPixels(asset, tileSize, scale);
            const fit = fitAssetFrameToGrid(asset, tileSize, scale);
            const image = this.add.image(pixel.x, pixel.y, textureKeyForAssetSource(asset.src), asset.key);

            if (isOfficeverseGeneratedAsset(asset)) {
              if (asset.category === "floor") {
                image
                  .setOrigin(0)
                  .setDisplaySize(footprint.width, footprint.height)
                  .setDepth(pixel.y - 4);
              } else {
                image
                  .setOrigin(0.5, 1)
                  .setPosition(pixel.x + footprint.width / 2, pixel.y + footprint.height)
                  .setScale(fit.scale)
                  .setDepth(pixel.y + footprint.height);
              }
            } else {
              image
                .setOrigin(0)
                .setScale(scale)
                .setDepth(pixel.y + asset.frame.h * scale);
            }

            image.setAngle(object.rotation ?? 0);

            this.objectGameObjects.push(image);

            if (asset.category === "floor") {
              image.setDepth(pixel.y - 4);
            }

            if (asset.category === "wall") {
              image.setDepth(pixel.y + 2);
            }

            if (asset.collidable) {
              const width = (asset.gridSize?.w ?? 1) * tileSize * scale;
              const height = (asset.gridSize?.h ?? 1) * tileSize * scale;
              this.objectSolidRects.push(new Phaser.Geom.Rectangle(pixel.x, pixel.y, width, height));
            }

            if (asset.interactive) {
              const highlight = this.add
                .rectangle(
                  pixel.x + footprint.width / 2,
                  pixel.y + footprint.height / 2,
                  footprint.width + 12,
                  footprint.height + 12,
                )
                .setStrokeStyle(3, 0xf8c85f, 0.95)
                .setDepth(pixel.y + footprint.height - 1);
              this.objectGameObjects.push(highlight);

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

        }

        private renderEditorGrid() {
          const office = stateRef.current.office;
          const graphics = this.add.graphics();
          graphics.setDepth(9990);
          graphics.lineStyle(1, 0x14b8a6, 0.26);
          graphics.setVisible(false);

          for (let x = 1; x < office.width; x += 1) {
            const pixelX = x * tileSize * scale;
            graphics.lineBetween(pixelX, tileSize * scale, pixelX, worldHeight - tileSize * scale);
          }

          for (let y = 1; y < office.height; y += 1) {
            const pixelY = y * tileSize * scale;
            graphics.lineBetween(tileSize * scale, pixelY, worldWidth - tileSize * scale, pixelY);
          }
          this.editorGrid = graphics;
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

        private createEditorInput() {
          this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (!editorStateRef.current.enabled) {
              return;
            }

            this.updateGhost(pointer.worldX, pointer.worldY);
          });

          this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (!editorStateRef.current.enabled) {
              return;
            }

            const x = Math.floor(pointer.worldX / (tileSize * scale));
            const y = Math.floor(pointer.worldY / (tileSize * scale));
            const office = stateRef.current.office;

            if (x >= 1 && y >= 1 && x < office.width - 1 && y < office.height - 1) {
              gridClickRef.current?.({ x, y });
            }
          });
        }

        private setEditorState(nextEditorState: EditorSceneState) {
          editorStateRef.current = nextEditorState;
          this.editorGrid?.setVisible(nextEditorState.enabled);

          if (nextEditorState.enabled) {
            this.cameras.main.stopFollow();
            this.fitCameraToOffice();
            this.ensureGhost();
            this.ghost?.setVisible(false);
          } else {
            this.ghost?.setVisible(false);
            if (this.player) {
              this.cameras.main.setZoom(1);
              this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
            }
          }
          this.updateSceneHud();
        }

        private fitCameraToOffice() {
          const fit = fitMapToViewport(
            { width: this.scale.width, height: this.scale.height },
            { width: worldWidth, height: worldHeight },
          );
          const zoom = Math.min(fit.zoom, 1);

          this.cameras.main.setZoom(zoom);
          this.cameras.main.centerOn(worldWidth / 2, worldHeight / 2);
        }

        private setObjects(objects: OfficeState["objects"]) {
          stateRef.current = {
            ...stateRef.current,
            objects,
          };
          this.renderObjects();
        }

        private ensureGhost() {
          if (this.ghost) {
            return;
          }

          this.ghost = this.add
            .rectangle(0, 0, tileSize * scale, tileSize * scale)
            .setOrigin(0)
            .setStrokeStyle(2, 0x14b8a6, 0.95)
            .setFillStyle(0x14b8a6, 0.18)
            .setDepth(9995)
            .setVisible(false);
        }

        private updateGhost(worldX: number, worldY: number) {
          this.ensureGhost();
          const asset = getAssetDefinition(editorStateRef.current.selectedAssetKey);
          const width = (asset?.gridSize?.w ?? 1) * tileSize * scale;
          const height = (asset?.gridSize?.h ?? 1) * tileSize * scale;
          const x = Math.floor(worldX / (tileSize * scale));
          const y = Math.floor(worldY / (tileSize * scale));
          const pixel = gridToPixel({ x, y }, tileSize, scale);
          const valid = this.isEditableCell(x, y, asset?.gridSize?.w ?? 1, asset?.gridSize?.h ?? 1);

          this.ghost
            ?.setPosition(pixel.x, pixel.y)
            .setSize(width, height)
            .setFillStyle(valid ? 0x14b8a6 : 0xef4444, 0.18)
            .setStrokeStyle(2, valid ? 0x14b8a6 : 0xef4444, 0.95)
            .setVisible(true);
        }

        private isEditableCell(x: number, y: number, width: number, height: number) {
          const office = stateRef.current.office;

          return x >= 1 && y >= 1 && x + width < office.width && y + height < office.height;
        }

        private canStandAt(x: number, y: number) {
          const foot = new Phaser.Geom.Rectangle(x - 10, y - 10, 20, 10);
          return ![...this.wallSolidRects, ...this.objectSolidRects].some((rect) =>
            Phaser.Geom.Intersects.RectangleToRectangle(foot, rect),
          );
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
        backgroundColor: "#211c17",
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
      controllerRef.current = null;
      game?.destroy(true);
    };
  }, [state.office.height, state.office.id, state.office.width, state.profile.avatar_id]);

  useEffect(() => {
    controllerRef.current?.setEditorState({ enabled: editorMode, selectedAssetKey, tool: editorTool });
  }, [editorMode, editorTool, selectedAssetKey]);

  useEffect(() => {
    controllerRef.current?.setObjects(state.objects);
  }, [state.objects]);

  return (
    <div className="h-full w-full overflow-hidden border-stone-900 bg-[#24313f] md:border-r-2">
      <div ref={containerRef} className="h-full w-full overflow-hidden" />
    </div>
  );
}
