"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "src/components/app-shell";
import { Button } from "src/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "src/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "src/components/ui/dialog";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Skeleton } from "src/components/ui/skeleton";
import { useClientId } from "src/lib/client-id";
import { albumKeys, albumsOptions } from "src/lib/query-options";
import { createAlbumMutationOptions } from "src/lib/query-options/mutations";
import { cn } from "src/lib/utils";

export default function HomePage() {
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
  const queryClient = useQueryClient();
  const create = useMutation({
    ...createAlbumMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
      setOpen(false);
      setNickname("");
    },
  });

  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    create.mutate({ nickname: nickname.trim(), albumType: "wc2026" });
  };

  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Meus Álbuns</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Criar álbum">
                <Plus className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Criar novo álbum</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nome do álbum</Label>
                  <Input
                    id="nickname"
                    placeholder="Ex: Meu Álbum Principal"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={create.isPending}
                >
                  {create.isPending ? "Criando..." : "Criar álbum"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

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
        ) : (
          <div className="space-y-4">
            <AlbumSection
              title="Meus Álbuns"
              albums={data?.owned ?? []}
              emptyText="Você ainda não criou nenhum álbum."
            />
            <AlbumSection
              title="Álbuns Compartilhados"
              albums={data?.shared ?? []}
              emptyText="Você ainda não entrou em nenhum álbum compartilhado."
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}

function AlbumSection({
  title,
  albums,
  emptyText,
}: {
  title: string;
  albums: {
    id: string;
    nickname: string;
    totalStickers: number;
    ownedCount: number;
    missingCount: number;
    duplicateCount: number;
    role: string;
  }[];
  emptyText: string;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
        <span className="font-semibold">{title}</span>
        {isOpen ? (
          <ChevronDown className="size-5" />
        ) : (
          <ChevronRight className="size-5" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        {albums.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          <ul className="space-y-2">
            {albums.map((album) => (
              <li key={album.id}>
                <Link
                  href={`/album/${album.id}`}
                  className={cn(
                    "block rounded-lg border bg-card p-4 shadow-sm transition-colors active:bg-accent",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{album.nickname}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {album.role === "owner" ? "dono" : album.role}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {album.ownedCount} / {album.totalStickers} figurinhas
                    {album.duplicateCount > 0 && (
                      <span className="ml-2 text-primary">
                        ({album.duplicateCount} trocas)
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
