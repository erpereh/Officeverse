"use client";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { selectAvatarAction, selectDebugAvatarAction } from "@/app/actions";
import { avatarDefinitions } from "@/lib/assets";
import { frontAvatarFrame } from "@/lib/office-direction";

type AvatarCarouselProps = {
  isDebug: boolean;
};

export function AvatarCarousel({ isDebug }: AvatarCarouselProps) {
  const [index, setIndex] = useState(0);
  const avatar = avatarDefinitions[index];
  const action = isDebug ? selectDebugAvatarAction : selectAvatarAction;
  const previewScale = 7;
  const stats = useMemo(
    () => [
      { label: "Foco", value: 70 + index * 6 },
      { label: "Velocidad", value: 82 - index * 4 },
      { label: "Estilo", value: 74 + ((index + 1) % 3) * 7 },
    ],
    [index],
  );

  function move(direction: "previous" | "next") {
    const offset = direction === "next" ? 1 : -1;
    setIndex((current) => (current + offset + avatarDefinitions.length) % avatarDefinitions.length);
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_360px] lg:items-stretch">
      <section className="rounded-lg border-2 border-stone-900 bg-[#fffdf2] p-5 shadow-[8px_8px_0_#2f2418]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            aria-label="Personaje anterior"
            className="inline-flex size-12 items-center justify-center rounded-md border-2 border-stone-900 bg-[#f8c85f] shadow-[3px_3px_0_#2f2418] transition hover:-translate-y-0.5"
            type="button"
            onClick={() => move("previous")}
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
          <div className="text-center">
            <p className="text-xs font-black uppercase text-teal-700">
              Selector de agente
            </p>
            <h2 className="text-4xl font-black text-stone-950">{avatar.name}</h2>
          </div>
          <button
            aria-label="Personaje siguiente"
            className="inline-flex size-12 items-center justify-center rounded-md border-2 border-stone-900 bg-[#f8c85f] shadow-[3px_3px_0_#2f2418] transition hover:-translate-y-0.5"
            type="button"
            onClick={() => move("next")}
          >
            <ChevronRight className="size-6" aria-hidden="true" />
          </button>
        </div>

        <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-md border-2 border-stone-900 bg-[linear-gradient(0deg,#d9c88e_1px,transparent_1px),linear-gradient(90deg,#d9c88e_1px,transparent_1px),#f6e6b8] bg-[size:32px_32px]">
          <div
            className="absolute inset-x-10 bottom-14 h-16 rounded-[50%] border-2 border-stone-900 opacity-80"
            style={{ backgroundColor: avatar.color }}
          />
          <div
            key={avatar.id}
            aria-label={`${avatar.name} mirando al frente`}
            className="pixelated relative z-10"
            role="img"
            style={{
              width: `${avatar.frame.width * previewScale}px`,
              height: `${avatar.frame.height * previewScale}px`,
              backgroundImage: `url(${avatar.src})`,
              backgroundPosition: `-${frontAvatarFrame * avatar.frame.width * previewScale}px 0`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${384 * previewScale}px ${avatar.frame.height * previewScale}px`,
            }}
          />
        </div>
      </section>

      <aside className="rounded-lg border-2 border-stone-900 bg-[#24313f] p-5 text-[#fff8df] shadow-[8px_8px_0_#2f2418]">
        <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-[#fff8df]/30 bg-[#fff8df]/10 px-3 py-2 text-xs font-black uppercase">
          <Sparkles className="size-4" aria-hidden="true" />
          {isDebug ? "Debug activo" : "Modo Supabase"}
        </div>
        <h3 className="text-2xl font-black">{avatar.role}</h3>
        <div className="mt-6 space-y-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="mb-1 flex justify-between text-xs font-black uppercase">
                <span>{stat.label}</span>
                <span className="tabular-nums">{stat.value}</span>
              </div>
              <div className="h-3 rounded-full border border-[#fff8df]/40 bg-black/30">
                <div
                  className="h-full rounded-full bg-[#f8c85f]"
                  style={{ width: `${stat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <form action={action} className="mt-8">
          <input type="hidden" name="avatar_id" value={avatar.id} />
          <button
            className="h-12 w-full rounded-md border-2 border-[#fff8df] bg-teal-500 px-4 text-sm font-black uppercase text-stone-950 shadow-[4px_4px_0_#fff8df] transition hover:-translate-y-0.5"
            type="submit"
          >
            Entrar a la oficina
          </button>
        </form>
      </aside>
    </div>
  );
}
