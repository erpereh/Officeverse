"use client";

import { Edit3, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { OfficeEditorPanel } from "@/components/office/office-editor-panel";
import { OfficeScene } from "@/components/office/office-scene";
import { assetDefinitions } from "@/lib/assets";
import {
  createObjectFromAsset,
  deleteObjectAt,
  type EditorTool,
  moveObjectAt,
  placeObject,
} from "@/lib/office-editor";
import { createClient } from "@/lib/supabase/client";
import type { Office, OfficeObject, OfficeState } from "@/lib/types";

type OfficeShellProps = {
  offices: Office[];
  state: OfficeState;
  userEmail: string;
  isDebug: boolean;
};

export function OfficeShell({ offices, state, userEmail, isDebug }: OfficeShellProps) {
  const router = useRouter();
  const firstAsset = useMemo(
    () =>
      assetDefinitions.find((asset) => asset.frame && asset.category !== "character")?.key ??
      "desk_basic",
    [],
  );
  const [objects, setObjects] = useState<OfficeObject[]>(state.objects);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTool, setEditorTool] = useState<EditorTool>("place");
  const [selectedAssetKey, setSelectedAssetKey] = useState(firstAsset);
  const [moveFrom, setMoveFrom] = useState<{ x: number; y: number } | null>(null);
  const [dirty, setDirty] = useState(false);
  const sceneState = useMemo(
    () => ({
      ...state,
      objects,
    }),
    [objects, state],
  );

  async function signOut() {
    if (isDebug) {
      router.replace("/debug/exit");
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  const handleGridClick = useCallback(
    (point: { x: number; y: number }) => {
      setObjects((current) => {
        if (editorTool === "delete") {
          setDirty(true);
          return deleteObjectAt(current, point);
        }

        if (editorTool === "move") {
          if (!moveFrom) {
            setMoveFrom(point);
            return current;
          }

          setDirty(true);
          setMoveFrom(null);
          return moveObjectAt(current, moveFrom, point);
        }

        setDirty(true);
        return placeObject(
          current,
          createObjectFromAsset(state.office.id, state.profile.id, selectedAssetKey, point),
        );
      });
    },
    [editorTool, moveFrom, selectedAssetKey, state.office.id, state.profile.id],
  );

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-[#fff8df]">
      <header className="flex h-[70px] shrink-0 items-center justify-between border-b-2 border-stone-900 bg-[#24313f] px-4 py-3 text-[#fff8df] md:px-6">
        <div>
          <p className="text-xs font-black uppercase text-[#f8c85f]">Officeverse</p>
          <h1 className="text-xl font-black">{state.office.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isDebug ? (
            <span className="rounded-md border border-[#f8c85f] bg-[#f8c85f] px-2 py-1 text-xs font-black text-stone-950">
              DEBUG
            </span>
          ) : null}
          <span className="hidden text-sm text-[#fff8df]/80 sm:inline">
            {userEmail}
          </span>
          <button
            aria-label={isDebug ? "Salir del modo debug" : "Cerrar sesion"}
            className="inline-flex size-10 items-center justify-center rounded-md border-2 border-[#fff8df] bg-transparent hover:bg-[#fff8df]/10"
            type="button"
            onClick={signOut}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 overflow-auto md:h-[calc(100dvh-70px)] md:grid-cols-[minmax(0,1fr)_320px] md:overflow-hidden">
        <section className="min-h-[520px] min-w-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,#ffd56d,transparent_26%),linear-gradient(135deg,#fff8df,#dfeec8)] md:min-h-0">
          <OfficeScene
            editorMode={editorOpen}
            state={sceneState}
            onGridClick={handleGridClick}
          />
        </section>
        <aside className="shrink-0 border-t-2 border-stone-900 bg-[#fffdf2] p-4 md:h-full md:overflow-auto md:border-l-2 md:border-t-0">
          <h2 className="text-sm font-black uppercase text-teal-700">HUD de oficina</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4 rounded-md border border-stone-200 bg-white px-3 py-2">
              <dt className="text-stone-600">Avatar</dt>
              <dd className="font-black">{state.profile.avatar_id}</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-md border border-stone-200 bg-white px-3 py-2">
              <dt className="text-stone-600">Mapa</dt>
              <dd className="font-black">
                {state.office.width} x {state.office.height}
              </dd>
            </div>
            <div className="flex justify-between gap-4 rounded-md border border-stone-200 bg-white px-3 py-2">
              <dt className="text-stone-600">Camara</dt>
              <dd className="font-black">Seguimiento</dd>
            </div>
            <div className="flex justify-between gap-4 rounded-md border border-stone-200 bg-white px-3 py-2">
              <dt className="text-stone-600">Decoracion</dt>
              <dd className="font-black tabular-nums">{state.objects.length}</dd>
            </div>
          </dl>
          <p className="mt-6 rounded-md border-2 border-stone-900 bg-[#f8c85f] p-3 text-sm font-semibold leading-6 text-stone-900 shadow-[4px_4px_0_#2f2418]">
            WASD o flechas para moverte. El armario sera la entrada al editor.
          </p>
          <button
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md border-2 border-stone-900 bg-[#f8c85f] text-sm font-black uppercase text-stone-950 shadow-[4px_4px_0_#2f2418]"
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
          >
            <Edit3 className="size-4" aria-hidden="true" />
            {editorOpen ? "Cerrar editor" : "Editar oficina"}
          </button>
          {editorOpen ? (
            <OfficeEditorPanel
              activeOffice={state.office}
              dirty={dirty}
              editorTool={editorTool}
              isDebug={isDebug}
              objects={objects}
              offices={offices}
              onClose={() => setEditorOpen(false)}
              onSaved={() => {
                setDirty(false);
                router.refresh();
              }}
              onSelectAsset={setSelectedAssetKey}
              onSetTool={(tool) => {
                setEditorTool(tool);
                setMoveFrom(null);
              }}
              selectedAssetKey={selectedAssetKey}
            />
          ) : null}
          {isDebug ? (
            <Link
              className="mt-4 flex h-11 items-center justify-center rounded-md border-2 border-stone-900 bg-teal-500 text-sm font-black uppercase text-stone-950 shadow-[4px_4px_0_#2f2418]"
              href="/onboarding/avatar"
            >
              Cambiar personaje
            </Link>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
