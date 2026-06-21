"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Lock, LockOpen, Search, Share2, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "src/components/app-shell";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { useClientId } from "src/lib/client-id";
import { getTeamFlag } from "src/lib/flags";
import { albumKeys, albumOptions } from "src/lib/query-options";
import { stickerOperationMutationOptions } from "src/lib/query-options/mutations";
import {
  extractStickerNumber,
  extractTeamPrefix,
  getQuantity,
} from "src/lib/sticker";
import { cn } from "src/lib/utils";

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "missing", label: "Faltam" },
  { key: "duplicates", label: "Trocas" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function AlbumPage() {
  const params = useParams();
  const albumId = params.id as string;
  const clientId = useClientId();

  const { data: album, isLoading } = useQuery({
    ...albumOptions(albumId),
    enabled: Boolean(albumId) && Boolean(clientId),
  });
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [locked, setLocked] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const canEdit = album?.role === "owner" || album?.role === "editor";
  const isLocked = locked || !canEdit;

  const mutate = useMutation({
    ...stickerOperationMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.list() });
    },
  });

  const pendingRef = useRef<Record<string, number>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const pending = pendingRef.current;
    pendingRef.current = {};

    for (const [stickerCode, delta] of Object.entries(pending)) {
      if (delta === 0) continue;
      const operation = delta > 0 ? "increment" : "decrement";
      const absoluteDelta = Math.abs(delta);
      for (let i = 0; i < absoluteDelta; i++) {
        mutate.mutate({
          albumId,
          operation: { operation, stickerCode },
        });
      }
    }
  }, [albumId, mutate]);

  const scheduleSync = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      applyPending();
    }, 1000);
  }, [applyPending]);

  const handleIncrement = useCallback(
    (stickerCode: string) => {
      if (isLocked) return;
      pendingRef.current[stickerCode] =
        (pendingRef.current[stickerCode] ?? 0) + 1;
      queryClient.setQueryData(albumOptions(albumId).queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          counts: {
            ...old.counts,
            [stickerCode]: (old.counts[stickerCode] ?? 0) + 1,
          },
        };
      });
      scheduleSync();
    },
    [albumId, isLocked, queryClient, scheduleSync],
  );

  const handleDecrement = useCallback(
    (stickerCode: string) => {
      if (isLocked || !album) return;
      const current = getQuantity(album.counts, stickerCode);
      if (current <= 0) return;
      pendingRef.current[stickerCode] =
        (pendingRef.current[stickerCode] ?? 0) - 1;
      queryClient.setQueryData(albumOptions(albumId).queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          counts: {
            ...old.counts,
            [stickerCode]: Math.max(0, (old.counts[stickerCode] ?? 0) - 1),
          },
        };
      });
      scheduleSync();
    },
    [album, albumId, isLocked, queryClient, scheduleSync],
  );

  useEffect(() => {
    return () => {
      applyPending();
    };
  }, [applyPending]);

  const filteredSections = useMemo(() => {
    if (!album) return [];

    const term = search.trim().toLowerCase();

    return album.catalog.stickers
      .filter((sticker) => {
        const quantity = getQuantity(album.counts, sticker.code);

        if (filter === "missing" && quantity !== 0) return false;
        if (filter === "duplicates" && quantity <= 1) return false;

        if (!term) return true;
        return (
          sticker.code.toLowerCase().includes(term) ||
          sticker.team.toLowerCase().includes(term)
        );
      })
      .reduce(
        (acc, sticker) => {
          if (!acc.lastTeam || acc.lastTeam.team !== sticker.team) {
            acc.lastTeam = { team: sticker.team, stickers: [] };
            acc.sections.push(acc.lastTeam);
          }
          acc.lastTeam.stickers.push(sticker);
          return acc;
        },
        {
          sections: [] as {
            team: string;
            stickers: typeof album.catalog.stickers;
          }[],
          lastTeam: null as {
            team: string;
            stickers: typeof album.catalog.stickers;
          } | null,
        },
      ).sections;
  }, [album, filter, search]);

  return (
    <AppShell>
      <div className="sticky top-0 z-10 border-b bg-background pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild aria-label="Voltar">
              <Link href="/">
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
            <h1 className="line-clamp-1 text-lg font-semibold">
              {album?.nickname ?? "Álbum"}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
            >
              {searchOpen ? (
                <X className="size-5" />
              ) : (
                <Search className="size-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              aria-label="Compartilhar"
            >
              <Link href={`/album/${albumId}/share`}>
                <Share2 className="size-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocked((v) => !v)}
              aria-label={locked ? "Destravar" : "Travar"}
            >
              {locked ? (
                <Lock className="size-5" />
              ) : (
                <LockOpen className="size-5" />
              )}
            </Button>
          </div>
        </div>

        {searchOpen && (
          <div className="px-4 pb-3">
            <Input
              placeholder="Código, nome ou time"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
        )}

        <div className="flex px-4">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "border-b-2 border-transparent flex-1 py-2 text-sm font-medium transition-colors",
                filter === f.key
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 p-4">
        {isLoading ? (
          <p className="py-8 text-center text-muted-foreground">
            Carregando...
          </p>
        ) : filteredSections.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Nenhuma figurinha encontrada.
          </p>
        ) : (
          filteredSections.map((section) => (
            <section key={section.team} className="rounded-lg border">
              <div className="border-b bg-muted/50 px-4 py-2 font-medium">
                <span className="mr-2">{getTeamFlag(section.team)}</span>
                {section.team}
                {(() => {
                  const prefix = extractTeamPrefix(
                    section.stickers[0]?.code ?? "",
                  );
                  return prefix ? (
                    <span className="ml-1 text-muted-foreground">
                      ⋅ {prefix}
                    </span>
                  ) : null;
                })()}
              </div>
              <div className="grid grid-cols-5 gap-3 p-3 sm:grid-cols-6">
                {section.stickers.map((sticker) => (
                  <StickerButton
                    key={sticker.code}
                    code={sticker.code}
                    name={sticker.name}
                    quantity={getQuantity(album?.counts ?? {}, sticker.code)}
                    onIncrement={() => handleIncrement(sticker.code)}
                    onDecrement={() => handleDecrement(sticker.code)}
                    disabled={isLocked}
                    isSpecial={isSpecialSticker(sticker.code)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
}

function isSpecialSticker(code: string): boolean {
  if (code === "00") {
    return true;
  }

  if (code.startsWith("FWC")) {
    return true;
  }

  return extractStickerNumber(code) === "1";
}

function StickerButton({
  code,
  name,
  quantity,
  onIncrement,
  onDecrement,
  disabled,
  isSpecial,
}: {
  code: string;
  name: string;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled: boolean;
  isSpecial: boolean;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const startLongPress = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onDecrement();
    }, 600);
  };

  const cancelLongPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerUp = () => {
    cancelLongPress();
    if (!isLongPress.current && !disabled) {
      onIncrement();
    }
  };

  const handlePointerLeave = () => {
    cancelLongPress();
  };

  const duplicateCount = quantity > 1 ? quantity - 1 : null;
  const state =
    quantity === 0 ? "missing" : quantity === 1 ? "owned" : "duplicate";

  const isGold = isSpecial && state === "missing";

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-[35%] text-sm font-semibold select-none",
        state === "missing" && !isGold && "bg-muted text-muted-foreground",
        state === "owned" &&
          !isGold &&
          "bg-primary text-primary-foreground line-through",
        state === "duplicate" &&
          !isGold &&
          "bg-primary text-primary-foreground line-through",
        isGold && "bg-amber-200 text-amber-950",
        disabled && "opacity-60",
      )}
      onPointerDown={startLongPress}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={`${code} ${name}`}
      title={`${code} - ${name}`}
    >
      {extractStickerNumber(code)}
      {duplicateCount && (
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {duplicateCount}
        </span>
      )}
    </button>
  );
}
