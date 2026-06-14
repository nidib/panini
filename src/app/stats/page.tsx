"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "src/components/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "src/components/ui/collapsible";
import { Skeleton } from "src/components/ui/skeleton";
import { useClientId } from "src/lib/client-id";
import { albumsOptions } from "src/lib/query-options";
import { cn } from "src/lib/utils";

export default function StatsPage() {
  const clientId = useClientId();
  const { data, isLoading, error, isError } = useQuery({
    ...albumsOptions(),
    enabled: Boolean(clientId),
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Não autorizado") {
        return false;
      }
      return failureCount < 3;
    },
  });

  const albums = [...(data?.owned ?? []), ...(data?.shared ?? [])];
  const [selectedId, setSelectedId] = useState<string | null>(
    albums[0]?.id ?? null,
  );

  const selectedAlbum = albums.find((a) => a.id === selectedId) ?? albums[0];

  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-bold">Estatísticas</h1>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">Erro ao carregar álbuns.</p>
            {error?.message && (
              <p className="mt-1 text-xs text-destructive/80">
                {error.message}
              </p>
            )}
          </div>
        ) : albums.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Você ainda não tem nenhum álbum.
          </p>
        ) : (
          <div className="space-y-4">
            <AlbumList
              albums={albums}
              selectedId={selectedAlbum?.id}
              onSelect={(id) => setSelectedId(id)}
            />

            {selectedAlbum && <AlbumStats album={selectedAlbum} />}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function AlbumList({
  albums,
  selectedId,
  onSelect,
}: {
  albums: {
    id: string;
    nickname: string;
    totalStickers: number;
    ownedCount: number;
    role: string;
  }[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
        <span className="font-semibold">Selecionar álbum</span>
        {isOpen ? (
          <ChevronDown className="size-5" />
        ) : (
          <ChevronRight className="size-5" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="space-y-2">
          {albums.map((album) => (
            <li key={album.id}>
              <button
                type="button"
                onClick={() => onSelect(album.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left shadow-sm transition-colors active:bg-accent",
                  selectedId === album.id && "border-primary",
                )}
              >
                <span className="font-medium">{album.nickname}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {album.role === "owner" ? "dono" : album.role}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function AlbumStats({
  album,
}: {
  album: {
    id: string;
    nickname: string;
    totalStickers: number;
    ownedCount: number;
    missingCount: number;
    duplicateCount: number;
  };
}) {
  const completion =
    album.totalStickers > 0
      ? Math.round((album.ownedCount / album.totalStickers) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{album.nickname}</h2>
        <Link
          href={`/album/${album.id}`}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Abrir álbum
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold">{completion}%</span>
            <span className="mb-1 text-sm text-muted-foreground">completo</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total de figurinhas" value={album.totalStickers} />
        <StatCard label="Obtidas" value={album.ownedCount} />
        <StatCard label="Faltam" value={album.missingCount} />
        <StatCard label="Repetidas" value={album.duplicateCount} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
