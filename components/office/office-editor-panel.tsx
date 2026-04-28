"use client";

import { Copy, Eraser, FolderPlus, Move, Paintbrush, Save, Trash2, Wand2, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";

import {
  createOfficeAction,
  deleteOfficeAction,
  duplicateOfficeAction,
  loadTemplateOfficeAction,
  renameOfficeAction,
  saveOfficeLayoutAction,
} from "@/app/actions";
import { assetDefinitions } from "@/lib/assets";
import type { EditorTool } from "@/lib/office-editor";
import type { Office, OfficeLayoutPayload, OfficeObject } from "@/lib/types";

type OfficeEditorPanelProps = {
  activeOffice: Office;
  dirty: boolean;
  editorTool: EditorTool;
  isDebug: boolean;
  objects: OfficeObject[];
  offices: Office[];
  onClose: () => void;
  onSaved: () => void;
  onSelectAsset: (assetKey: string) => void;
  onSetTool: (tool: EditorTool) => void;
  selectedAssetKey: string;
};

const placeableAssets = assetDefinitions.filter(
  (asset) => asset.frame && asset.category !== "character",
);

export function OfficeEditorPanel({
  activeOffice,
  dirty,
  editorTool,
  isDebug,
  objects,
  offices,
  onClose,
  onSaved,
  onSelectAsset,
  onSetTool,
  selectedAssetKey,
}: OfficeEditorPanelProps) {
  const [tab, setTab] = useState<"assets" | "offices" | "tools">("assets");
  const [category, setCategory] = useState("all");
  const [isPending, startTransition] = useTransition();
  const filteredAssets = useMemo(
    () =>
      placeableAssets.filter((asset) => category === "all" || asset.category === category),
    [category],
  );

  function save() {
    const payload: OfficeLayoutPayload = {
      officeId: activeOffice.id,
      objects: objects.map((object) => ({
        object_type: object.object_type,
        asset_key: object.asset_key,
        x: object.x,
        y: object.y,
        rotation: object.rotation,
        layer: object.layer,
        metadata: object.metadata,
      })),
    };

    startTransition(async () => {
      await saveOfficeLayoutAction(isDebug, payload);
      onSaved();
    });
  }

  function openOffice(officeId: string) {
    if (dirty && !window.confirm("Hay cambios sin guardar. Cambiar de oficina descartara esos cambios.")) {
      return;
    }

    window.location.href = `/office?office=${officeId}`;
  }

  function createOffice() {
    if (dirty && !window.confirm("Hay cambios sin guardar. Crear una oficina descartara esos cambios.")) {
      return;
    }

    startTransition(async () => {
      const officeId = await createOfficeAction(isDebug);
      window.location.href = `/office?office=${officeId}`;
    });
  }

  function duplicateOffice() {
    startTransition(async () => {
      const officeId = await duplicateOfficeAction(isDebug, activeOffice.id);
      window.location.href = `/office?office=${officeId}`;
    });
  }

  function deleteOffice() {
    if (!window.confirm("Eliminar esta oficina? Esta accion no se puede deshacer.")) {
      return;
    }

    startTransition(async () => {
      const officeId = await deleteOfficeAction(isDebug, activeOffice.id);
      window.location.href = `/office?office=${officeId}`;
    });
  }

  function renameOffice() {
    const name = window.prompt("Nombre de la oficina", activeOffice.name);

    if (!name) {
      return;
    }

    startTransition(async () => {
      await renameOfficeAction(isDebug, activeOffice.id, name);
      window.location.href = `/office?office=${activeOffice.id}`;
    });
  }

  function loadTemplate() {
    if (!window.confirm("Cargar plantilla reemplazara el layout actual guardado de esta oficina.")) {
      return;
    }

    startTransition(async () => {
      await loadTemplateOfficeAction(isDebug, activeOffice.id);
      window.location.href = `/office?office=${activeOffice.id}`;
    });
  }

  return (
    <div className="mt-4 rounded-lg border-2 border-stone-900 bg-[#24313f] p-3 text-[#fff8df] shadow-[5px_5px_0_#2f2418]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-[#f8c85f]">Editor</p>
          <h3 className="text-lg font-black">{activeOffice.name}</h3>
        </div>
        <button
          aria-label="Cerrar editor"
          className="inline-flex size-10 items-center justify-center rounded-md border-2 border-[#fff8df] hover:bg-white/10"
          type="button"
          onClick={onClose}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-black uppercase">
        {(["assets", "tools", "offices"] as const).map((item) => (
          <button
            key={item}
            className={`h-10 rounded-md border-2 border-stone-950 ${
              tab === item ? "bg-[#f8c85f] text-stone-950" : "bg-[#fff8df]/10"
            }`}
            type="button"
            onClick={() => setTab(item)}
          >
            {item === "assets" ? "Objetos" : item === "tools" ? "Tools" : "Oficinas"}
          </button>
        ))}
      </div>

      {tab === "assets" ? (
        <div className="mt-3">
          <select
            aria-label="Filtrar objetos"
            className="h-10 w-full rounded-md border-2 border-stone-950 bg-[#fff8df] px-2 text-sm font-bold text-stone-950"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">Todas</option>
            <option value="furniture">Muebles</option>
            <option value="wall">Pared</option>
            <option value="floor">Suelo/deco</option>
            <option value="interactive">Interactivos</option>
          </select>
          <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-auto pr-1">
            {filteredAssets.map((asset) => (
              <button
                key={asset.key}
                className={`rounded-md border-2 p-2 text-left text-xs ${
                  selectedAssetKey === asset.key
                    ? "border-[#f8c85f] bg-teal-500 text-stone-950"
                    : "border-[#fff8df]/25 bg-[#fff8df]/10"
                }`}
                type="button"
                onClick={() => {
                  onSelectAsset(asset.key);
                  onSetTool("place");
                }}
              >
                <span className="block font-black">{asset.name}</span>
                <span className="mt-1 block text-[11px] opacity-80">
                  {asset.gridSize?.w ?? 1}x{asset.gridSize?.h ?? 1}
                  {asset.collidable ? " bloquea" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "tools" ? (
        <div className="mt-3 space-y-2">
          <ToolButton active={editorTool === "place"} icon={<Paintbrush />} label="Colocar" onClick={() => onSetTool("place")} />
          <ToolButton active={editorTool === "move"} icon={<Move />} label="Mover" onClick={() => onSetTool("move")} />
          <ToolButton active={editorTool === "delete"} icon={<Eraser />} label="Borrar" onClick={() => onSetTool("delete")} />
          <ToolButton active={false} icon={<Wand2 />} label="Cargar plantilla" onClick={loadTemplate} />
          <button
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border-2 border-[#fff8df] bg-teal-500 text-sm font-black uppercase text-stone-950 shadow-[3px_3px_0_#fff8df] disabled:opacity-60"
            type="button"
            disabled={isPending}
            onClick={save}
          >
            <Save className="size-4" aria-hidden="true" />
            {dirty ? "Guardar cambios" : "Guardado"}
          </button>
        </div>
      ) : null}

      {tab === "offices" ? (
        <div className="mt-3 space-y-2">
          <button
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md border-2 border-[#fff8df] bg-[#f8c85f] text-sm font-black uppercase text-stone-950"
            type="button"
            onClick={createOffice}
          >
            <FolderPlus className="size-4" aria-hidden="true" />
            Nueva oficina
          </button>
          <div className="max-h-48 space-y-2 overflow-auto pr-1">
            {offices.map((office) => (
              <button
                key={office.id}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm font-black ${
                  office.id === activeOffice.id
                    ? "border-[#f8c85f] bg-[#f8c85f] text-stone-950"
                    : "border-[#fff8df]/20 bg-[#fff8df]/10"
                }`}
                type="button"
                onClick={() => openOffice(office.id)}
              >
                {office.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className="h-10 rounded-md border border-white/30 text-xs font-black" type="button" onClick={renameOffice}>
              Renombrar
            </button>
            <button className="inline-flex h-10 items-center justify-center rounded-md border border-white/30" type="button" onClick={duplicateOffice}>
              <Copy className="size-4" aria-hidden="true" />
            </button>
            <button className="inline-flex h-10 items-center justify-center rounded-md border border-red-300 text-red-200" type="button" onClick={deleteOffice}>
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-xs font-semibold text-[#fff8df]/75">
        {dirty ? "Cambios pendientes" : "Layout sincronizado"} · Click en la grid para editar.
      </p>
    </div>
  );
}

function ToolButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-11 w-full items-center gap-2 rounded-md border-2 px-3 text-sm font-black uppercase ${
        active
          ? "border-[#f8c85f] bg-[#f8c85f] text-stone-950"
          : "border-[#fff8df]/30 bg-[#fff8df]/10"
      }`}
      type="button"
      onClick={onClick}
    >
      <span className="[&_svg]:size-4" aria-hidden="true">
        {icon}
      </span>
      {label}
    </button>
  );
}
