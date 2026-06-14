"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "src/components/app-shell";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { joinInviteMutationOptions } from "src/lib/query-options/mutations";

export default function JoinInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const join = useMutation({
    ...joinInviteMutationOptions,
    onSuccess: (data) => {
      router.push(`/album/${data.id}`);
    },
    onError: () => {
      setError("Convite inválido ou senha incorreta.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) return;
    join.mutate({ token, password: password.trim() });
  };

  return (
    <AppShell>
      <div className="flex min-h-[60dvh] items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Entrar em um álbum</CardTitle>
            <CardDescription>
              Digite a senha do convite para acessar o álbum.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha do convite</Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="XXXX-XXXX"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={join.isPending || !password.trim()}
              >
                {join.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 size-4" />
                )}
                {join.isPending ? "Entrando..." : "Entrar no álbum"}
              </Button>

              <Button variant="link" className="w-full" asChild>
                <Link href="/">Voltar para meus álbuns</Link>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
