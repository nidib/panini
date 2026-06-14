"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Copy, Eye, RefreshCw, Share2, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AppShell } from "src/components/app-shell";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Skeleton } from "src/components/ui/skeleton";
import { useClientId } from "src/lib/client-id";
import { albumOptions } from "src/lib/query-options";
import { createInviteMutationOptions } from "src/lib/query-options/mutations";
import { cn } from "src/lib/utils";

const ROLES = [
  { key: "editor", label: "Editor", description: "Pode editar figurinhas" },
  { key: "viewer", label: "Visualizador", description: "Somente leitura" },
] as const;

export default function SharePage() {
  const params = useParams();
  const albumId = params.id as string;
  const clientId = useClientId();
  const queryClient = useQueryClient();

  const { data: album, isLoading } = useQuery({
    ...albumOptions(albumId),
    enabled: Boolean(albumId) && Boolean(clientId),
  });

  const createInvite = useMutation({
    ...createInviteMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const isOwner = album?.role === "owner";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleCopy = async (text: string, type: "link" | "password") => {
    await navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const generated = createInvite.data;
  const inviteLink = generated ? `${baseUrl}/convite/${generated.token}` : "";

  return (
    <AppShell>
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Voltar">
            <Link href={`/album/${albumId}`}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Compartilhar álbum</h1>
        </div>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !album ? (
          <p className="py-8 text-center text-muted-foreground">
            Álbum não encontrado.
          </p>
        ) : !isOwner ? (
          <p className="py-8 text-center text-muted-foreground">
            Apenas o dono do álbum pode criar convites.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3">
              {ROLES.map((role) => (
                <Card key={role.key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {role.key === "editor" ? (
                        <Users className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                      {role.label}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {generated?.role === role.key ? (
                      <GeneratedInvite
                        role={role.label}
                        link={inviteLink}
                        password={generated.password}
                        copiedLink={copiedLink}
                        copiedPassword={copiedPassword}
                        onCopyLink={() => handleCopy(inviteLink, "link")}
                        onCopyPassword={() =>
                          handleCopy(generated.password, "password")
                        }
                        onRegenerate={() =>
                          createInvite.mutate({
                            albumId,
                            input: { role: role.key },
                          })
                        }
                        isRegenerating={createInvite.isPending}
                      />
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() =>
                          createInvite.mutate({
                            albumId,
                            input: { role: role.key },
                          })
                        }
                        disabled={createInvite.isPending}
                      >
                        {createInvite.isPending ? (
                          "Gerando..."
                        ) : (
                          <>
                            <Share2 className="mr-2 size-4" />
                            Gerar convite {role.label.toLowerCase()}
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function GeneratedInvite({
  role,
  link,
  password,
  copiedLink,
  copiedPassword,
  onCopyLink,
  onCopyPassword,
  onRegenerate,
  isRegenerating,
}: {
  role: string;
  link: string;
  password: string;
  copiedLink: boolean;
  copiedPassword: boolean;
  onCopyLink: () => void;
  onCopyPassword: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="invite-link">Link do convite ({role})</Label>
        <div className="flex gap-2">
          <Input id="invite-link" value={link} readOnly />
          <Button
            variant="outline"
            size="icon"
            onClick={onCopyLink}
            aria-label="Copiar link"
          >
            <Copy className={cn("size-4", copiedLink && "text-primary")} />
          </Button>
        </div>
        {copiedLink && <p className="text-xs text-primary">Link copiado!</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="invite-password">Senha do convite</Label>
        <div className="flex gap-2">
          <Input id="invite-password" value={password} readOnly />
          <Button
            variant="outline"
            size="icon"
            onClick={onCopyPassword}
            aria-label="Copiar senha"
          >
            <Copy className={cn("size-4", copiedPassword && "text-primary")} />
          </Button>
        </div>{" "}
        {copiedPassword && (
          <p className="text-xs text-primary">Senha copiada!</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={onRegenerate}
        disabled={isRegenerating}
      >
        <RefreshCw className="mr-2 size-4" />
        {isRegenerating ? "Gerando..." : "Gerar novo convite"}
      </Button>
    </div>
  );
}
